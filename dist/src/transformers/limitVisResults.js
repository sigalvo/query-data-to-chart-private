'use strict';
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
//#region Imports
var _ = require("lodash");
var moment = require("moment");
var chartModels_1 = require("../common/chartModels");
var chartAggregation_1 = require("./chartAggregation");
//#endregion Imports
var LimitedResults = /** @class */ (function () {
    function LimitedResults(rows, orderedXValues, isAggregationApplied, isPartialData) {
        if (rows === void 0) { rows = []; }
        if (orderedXValues === void 0) { orderedXValues = []; }
        if (isAggregationApplied === void 0) { isAggregationApplied = false; }
        if (isPartialData === void 0) { isPartialData = false; }
        this.rows = rows;
        this.orderedXValues = orderedXValues;
        this.isAggregationApplied = isAggregationApplied;
        this.isPartialData = isPartialData;
    }
    return LimitedResults;
}());
exports.LimitedResults = LimitedResults;
var _LimitVisResults = /** @class */ (function () {
    function _LimitVisResults() {
    }
    //#region Public methods
    _LimitVisResults.prototype.escapeStr = function (value) {
        // Don't escape non-string or timestamp values
        if (typeof (value) !== 'string' || moment(value).isValid()) {
            return value;
        }
        return _.escape(value);
    };
    /**
     * 1. Remove rows when the number of unique X-axis values exceeds 'maxUniqueXValues'.
     *    The method will take the biggest 'maxUniqueXValues' X-axis values, and all other X-axis values will be summed and added as 'Others'
     * 2. Escape all row values to avoid XSS
     * 3. Perform aggregation on rows with the same X, Y, and SplitBy values.
     */
    _LimitVisResults.prototype.limitAndAggregateRows = function (params) {
        var limitedResults = new LimitedResults();
        var aggregationMethod = chartAggregation_1.ChartAggregation.getAggregationMethod(params.aggregationType);
        var internalParams = __assign({ aggregationMethod: aggregationMethod }, params);
        this.limitAllRows(internalParams, limitedResults);
        this.aggregateAndEscapeRows(internalParams, limitedResults);
        // Sort the x-Axis only if it's a date time column
        if (params.xColumnType === chartModels_1.DraftColumnType.DateTime) {
            limitedResults.rows = _.sortBy(limitedResults.rows, function (row) {
                return moment(row[0]).valueOf();
            });
        }
        return limitedResults;
    };
    //#endregion Public methods
    //#region Private methods
    _LimitVisResults.prototype.getHashCode = function (str) {
        var strLength = str.length;
        if (strLength === 0) {
            return 0;
        }
        var hash = 0;
        for (var i = 0; i < strLength; i++) {
            var charCode = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + charCode;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    };
    _LimitVisResults.prototype.getKey = function (row) {
        // Creating a key made of the x-field and the split-by-fields
        var key = '';
        var separator = '_';
        for (var columnIndex = 0; columnIndex < row.length; ++columnIndex) {
            var val = row[columnIndex] || '';
            key += val + separator;
        }
        var hashCode = this.getHashCode(key);
        return hashCode.toString();
    };
    _LimitVisResults.prototype.applyAggregation = function (aggregatedRowsInfo, aggregationMethod) {
        var aggregatedRows = [];
        var aggregationApplied = false;
        aggregatedRowsInfo.forEach(function (aggregatedRowData) {
            var aggregatedRow = aggregatedRowData.transformedRow;
            aggregatedRowData.yValues.forEach(function (yValues) {
                // If any aggregation is applied, raise flag
                if (yValues.length > 1) {
                    aggregationApplied = true;
                }
                // In case there are no valid values, return undefined
                var aggregatedYValue = yValues.length > 0 ? aggregationMethod(yValues) : undefined;
                aggregatedRow.push(aggregatedYValue);
            });
            aggregatedRows.push(aggregatedRow);
        });
        return {
            rows: aggregatedRows,
            isAggregated: aggregationApplied
        };
    };
    _LimitVisResults.prototype.limitOriginalRows = function (params, limitedResults, indexOfLimitedColumn, rowsToDisplayHash, createOtherColumn) {
        if (createOtherColumn === void 0) { createOtherColumn = false; }
        var otherRows = [];
        // All the rows that were limited, will be count as 'Other'
        if (createOtherColumn) {
            var otherRow_1 = [];
            otherRow_1[indexOfLimitedColumn] = params.otherStr;
            params.indexesOfYColumns.forEach(function (yIndex) {
                otherRow_1[yIndex] = [];
            });
            otherRows.push(otherRow_1);
        }
        var limitedRows = [];
        // Add only the rows with the biggest count, all others will we counted as the 'Other' row
        limitedResults.rows.forEach(function (row, i) {
            if (rowsToDisplayHash.hasOwnProperty(row[indexOfLimitedColumn])) {
                limitedRows.push(row);
            }
            else {
                var rowClone = _.clone(row);
                if (createOtherColumn) {
                    var otherRow_2 = otherRows[0];
                    params.indexesOfYColumns.forEach(function (yIndex) {
                        otherRow_2[yIndex].push(row[yIndex]);
                    });
                }
                else {
                    rowClone[indexOfLimitedColumn] = params.otherStr;
                    otherRows.push(rowClone);
                }
            }
        });
        if (createOtherColumn) {
            var otherRow_3 = otherRows[0];
            // Aggregate all Y Values
            params.indexesOfYColumns.forEach(function (yIndex) {
                otherRow_3[yIndex] = params.aggregationMethod(otherRow_3[yIndex]);
            });
        }
        limitedResults.rows = limitedRows.concat(otherRows);
    };
    _LimitVisResults.prototype.limitRows = function (params, limitedResults, indexOfLimitedColumn, createOtherColumn) {
        if (createOtherColumn === void 0) { createOtherColumn = false; }
        var rows = limitedResults.rows;
        if (rows.length <= params.maxUniqueXValues) {
            return;
        }
        var totalCountRowsHash = {};
        var totalCountRowsHashLength = 0;
        // Aggregate the total count for each unique value
        rows.forEach(function (row) {
            var limitedColumnValue = row[indexOfLimitedColumn];
            var yValues = _.map(params.indexesOfYColumns, function (yIndex) {
                return row[yIndex];
            });
            if (!totalCountRowsHash.hasOwnProperty(limitedColumnValue)) {
                totalCountRowsHash[limitedColumnValue] = { limitedColumnValue: limitedColumnValue, yValues: yValues };
                totalCountRowsHashLength++;
            }
            else {
                var prevYValues = totalCountRowsHash[limitedColumnValue].yValues;
                totalCountRowsHash[limitedColumnValue].yValues = prevYValues.concat(yValues);
            }
        });
        if (totalCountRowsHashLength <= params.maxUniqueXValues) {
            return;
        }
        // Apply the aggregation for all the yValues of the same key
        for (var key in totalCountRowsHash) {
            if (totalCountRowsHash.hasOwnProperty(key)) {
                var totalCountRow = totalCountRowsHash[key];
                totalCountRow.totalYValue = params.aggregationMethod(totalCountRow.yValues);
            }
        }
        // Sort the unique values by the total count
        var sortedTotalCountRows = _.sortBy(totalCountRowsHash, function (row) {
            return (-1) * row.totalYValue;
        });
        // Leave only the biggest maxUniqueXValues unique values
        var rowsToDisplayArr = sortedTotalCountRows.splice(0, params.maxUniqueXValues);
        var rowsToDisplayHash = {};
        // Convert the limited total count array to a hash
        _.forEach(rowsToDisplayArr, function (limitedTotalCountRow) {
            rowsToDisplayHash[limitedTotalCountRow.limitedColumnValue] = true;
        });
        this.limitOriginalRows(params, limitedResults, indexOfLimitedColumn, rowsToDisplayHash, createOtherColumn);
    };
    _LimitVisResults.prototype.limitXValues = function (params, limitedResults) {
        var originalRows = params.queryResultData.rows;
        limitedResults.rows = originalRows;
        limitedResults.isPartialData = false;
        // Don't limit DateTime X values
        if (params.xColumnType === chartModels_1.DraftColumnType.DateTime) {
            return;
        }
        this.limitRows(params, limitedResults, /*indexOfLimitedColumn*/ params.indexOfXColumn, /*createOtherColumn*/ true);
        // Mark that the X values were limited
        if (limitedResults.rows.length < originalRows.length) {
            limitedResults.isPartialData = true;
        }
    };
    _LimitVisResults.prototype.limitAllRows = function (params, limitedResults) {
        var _this = this;
        this.limitXValues(params, limitedResults);
        params.indexesOfSplitByColumns.forEach(function (indexOfSplitByColumn) {
            _this.limitRows(params, limitedResults, indexOfSplitByColumn);
        });
    };
    /**
    * Performs _.escape for all the rows values. In addition:
    * There are cases where we have multiple rows with the same values for the x-field and the split-by fields if exists.
    * In these cases we need to use one aggregated row instead where the y-value is aggregated.
    * For example, assume we get the following results to the query
    * requests | limit 20 | summarize count() by bin(timestamp, 1h), client_Browser
    * timestamp            | client_Browser        | count_
    * 2016-08-02T10:00:00Z	| Chrome 51.0	        | 15
    * 2016-08-02T10:00:00Z	| Internet Explorer 9.0	| 4
    * If the user chose to show the results where x-field == timestamp, y-field == count_, no split by, we need to aggregate the
    * values of the same timestamp value and return one row with ["2016-08-02T10:00:00Z", 19].
    * The algorithm we use here, calculates for each row in the results a hash code for the x-field-value and the split-by-fields-values.
    * Then we aggregate the y-Values in rows that correspond to the same hash code.
    */
    _LimitVisResults.prototype.aggregateAndEscapeRows = function (params, limitedResults) {
        var _this = this;
        var aggregatedRowInfoMap = {};
        limitedResults.rows.forEach(function (row, index) {
            var xValue = row[params.indexOfXColumn];
            var transformedRow = [_this.escapeStr(xValue)];
            // Add all split-by values
            params.indexesOfSplitByColumns.forEach(function (splitByIndex) {
                transformedRow.push(_this.escapeStr(row[splitByIndex]));
            });
            var key = _this.getKey(transformedRow);
            if (!aggregatedRowInfoMap.hasOwnProperty(key)) {
                aggregatedRowInfoMap[key] = {
                    order: index,
                    transformedRow: transformedRow,
                    yValues: []
                };
                params.indexesOfYColumns.forEach(function (yValue) {
                    aggregatedRowInfoMap[key].yValues.push([]);
                });
            }
            // Add the Y-values, to be later aggregated
            params.indexesOfYColumns.forEach(function (yIndex, i) {
                var yValue = row[yIndex];
                // Ignore undefined/null values
                if (yValue != undefined) {
                    var yValues = aggregatedRowInfoMap[key].yValues[i];
                    yValues.push(_this.escapeStr(yValue));
                }
            });
        });
        // Restore rows order
        var aggregatedRowInfo = _.sortBy(aggregatedRowInfoMap, 'order');
        var aggregationResult = this.applyAggregation(aggregatedRowInfo, params.aggregationMethod);
        limitedResults.orderedXValues = _.map(limitedResults.rows, function (row) {
            return row[params.indexOfXColumn];
        }) || [];
        limitedResults.isAggregationApplied = aggregationResult.isAggregated;
        limitedResults.rows = aggregationResult.rows;
    };
    return _LimitVisResults;
}());
exports._LimitVisResults = _LimitVisResults;
/**
 * export a Singleton class
 */
exports.LimitVisResultsSingleton = new _LimitVisResults();
//# sourceMappingURL=limitVisResults.js.map