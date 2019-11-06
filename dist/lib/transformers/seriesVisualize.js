'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
//#region Imports
var _ = require("lodash");
var moment = require("moment");
var chartModels_1 = require("../common/chartModels");
/*
 * Singleton class
 * This class transforms results that represents time series to such form that will enable their visualization.
*  First, the class checks if the results represents time series and only if they are - transform it.
*  The transformation is being made by multiplying the rows.
*
* Example:
*
*       Original results:
*           ["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z"]       [10, 20]        Seg1
*           ["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z"]       [30, 40]        Seg2
*
*       Transform to:
*           "2016-11-10T06:00:00.0000000Z"        10          Seg1
*           "2016-11-10T07:00:00.0000000Z"        20          Seg1
*           "2016-11-10T06:00:00.0000000Z"        30          Seg2
*           "2016-11-10T07:00:00.0000000Z"        40          Seg2
*/
var SeriesVisualize = /** @class */ (function () {
    //#endregion Private static members
    //#region Private constructor
    function SeriesVisualize() {
    }
    //#endregion Private constructor
    //#region Public static methods
    SeriesVisualize.getInstance = function () {
        if (!SeriesVisualize.instance) {
            SeriesVisualize.instance = new SeriesVisualize();
        }
        return SeriesVisualize.instance;
    };
    //#endregion Public static methods
    //#region Public methods
    /**
     * Tries to resolve the results as series.
     * If the first row data doesn't match series result -> return immediately.
     * When succeeds to resolve as series, construct the new query data and return it.
     * @param queryResultData - The original query result data
     * @returns The series info with the updated query result data if the results are resolved as a series.
     *          In this case the results are updated by expanding the original queryResult.rows, and adding the series column if needed.
     *          Otherwise, returns null
     */
    SeriesVisualize.prototype.tryResolveResultsAsSeries = function (queryResultData) {
        if (!queryResultData || !queryResultData.rows || !queryResultData.columns) {
            return null;
        }
        var clonedData = _.cloneDeep(queryResultData);
        var newRows = clonedData.rows;
        var newColumns = clonedData.columns;
        // Check if the first row matches a series pattern
        // The assumption is that most of the non-series results will be detected at this early stage
        // If it matches a series pattern - gets the indexes of the series columns
        var seriesColumnsInformation = this.isSeriesPattern(newColumns, newRows);
        if (!seriesColumnsInformation.isSeries) {
            return null;
        }
        var dateTimeIndecies = seriesColumnsInformation.dateTimeIndices;
        var numbersIndecies = seriesColumnsInformation.numberIndecies;
        // Validates and updates the columns that suspected as series
        // Updates newColumns, dateTimeIndecies and numbersIndecies
        this.validateAndUpdateSeriesColumns(newColumns, newRows, dateTimeIndecies, numbersIndecies);
        // Mark all validated fields
        var validatedColumnsCount = 0;
        var arrayLength = newColumns[dateTimeIndecies[0]].arrayItemsLength;
        var seriesColumnsIndecies = dateTimeIndecies.concat(numbersIndecies);
        for (var i = 0; i < seriesColumnsIndecies.length; i++) {
            var columnIndex = seriesColumnsIndecies[i];
            var column = newColumns[columnIndex];
            if (column.arrayItemsLength === arrayLength) {
                column.type = column.arrayItemsType;
                column.validatedForSeries = true;
                validatedColumnsCount++;
            }
        }
        // If we don't have at least 2 array dimensions - we won't be able to render the chart
        if (validatedColumnsCount < 2) {
            return null;
        }
        // Check if a string column exists to be used for segmentation of the results
        var isStringColumnExist = newColumns.some(function (column) {
            return !column.validatedForSeries && column.type === chartModels_1.DraftColumnType.String;
        });
        // If a string column doesn't exist - create a synthetic one
        if (!isStringColumnExist && newRows.length > 1) {
            this.addSeriesColumn(newRows, newColumns);
        }
        // Makes the expansion of the results
        newRows = this.expandAllRowsForSeries(newRows, newColumns, arrayLength);
        return {
            rows: newRows,
            columns: newColumns
        };
    };
    //#endregion Public methods
    //#region Private methods
    SeriesVisualize.prototype.isDateTime = function (str) {
        var date = new Date(str);
        return date && moment(date).isValid();
    };
    /* Gets the type of the item.
    * if it's a number - return 'Real'
    * if it's a string - check if it represents datetime.
    * Otherwise, return undefined.
    */
    SeriesVisualize.prototype.getItemFieldType = function (value) {
        var type = typeof value;
        switch (type) {
            case 'number': {
                return chartModels_1.DraftColumnType.Real;
            }
            case 'string': {
                if (this.isDateTime(value)) {
                    return chartModels_1.DraftColumnType.DateTime;
                }
                else {
                    return chartModels_1.DraftColumnType.String;
                }
            }
            default: {
                return undefined;
            }
        }
    };
    /**
     * Runs over all the columns that suspected as a series of timestamps or numbers and checks if all values fulfill:
     *      1. All value are arrays.
     *      2. All arrays are with the same size.
     *      3. All items in all array are of the same type.
     * If all fulfilled - add type and length information to the column.
     * Filters from dateTimeIndecies and numbersIndecies any columns indices that are not valid series.
     *
     * @param newColumns - query result columns
     * @param newRows - query result rows
     * @param dateTimeIndecies - The indecies of the columns that are suspected as dateTimes series.
     * @param numbersIndecies - The indecies of the columns that are suspected as numbers series.
     */
    SeriesVisualize.prototype.validateAndUpdateSeriesColumns = function (newColumns, newRows, dateTimeIndecies, numbersIndecies) {
        var _this = this;
        dateTimeIndecies = dateTimeIndecies.filter(function (index) {
            return _this.validateAndUpdateSeriesColumn(newColumns, newRows, index);
        });
        numbersIndecies = numbersIndecies.filter(function (index) {
            return _this.validateAndUpdateSeriesColumn(newColumns, newRows, index);
        });
    };
    /**
     * If the column is dynamic - Runs through all rows and checks if all values fulfill:
     *      1. All value are arrays.
     *      2. All arrays are with the same size.
     *      3. All items in all array are of the same type.
     * If all fulfilled - add type and length information to the column.
     * @param columns - query result columns
     * @param rows - query result rows
     * @param columnIndex - The index of the column we're working on
     * @returns True if the column is validated as series
     */
    SeriesVisualize.prototype.validateAndUpdateSeriesColumn = function (columns, rows, columnIndex) {
        var column = columns[columnIndex];
        // The column is not dynamic - leave it as is
        if (column.type !== chartModels_1.DraftColumnType.Dynamic) {
            return false;
        }
        // The column is defined as dymanic by kusto and has type string
        // Try parse this column for all rows and check if all the rows are valid arrays of a specific type
        // If such type was found - add the type and the array sizes to the column info
        var columnType;
        var columnArrayLength;
        for (var j = 0; j < rows.length; j++) {
            var currentValues = void 0;
            try {
                currentValues = JSON.parse(rows[j][columnIndex]);
            }
            catch (ex) {
                // Value is not a valid json - return with no info about the column
                return false;
            }
            if (!Array.isArray(currentValues) || currentValues.length === 0) {
                // Value is not an array - return with no info about the column
                return false;
            }
            // Checks that all rows have the same size of array
            if (columnArrayLength !== undefined && currentValues.length !== columnArrayLength) {
                // Values are not with same length as the previous arrays - return with no info about the column
                return false;
            }
            else {
                columnArrayLength = currentValues.length;
            }
            for (var i = 0; i < currentValues.length; i++) {
                // Allow null values in this flow, the null values won't be displayed in the chart, so we can ignore them
                if (currentValues[i]) {
                    var type = this.getItemFieldType(currentValues[i]);
                    if (type === undefined) {
                        // Type not recognized - return with no information about the column
                        return false;
                    }
                    if (columnType !== undefined && type !== columnType) {
                        // Type not match previous types - return with no information about the column
                        return false;
                    }
                    else {
                        columnType = type;
                    }
                }
            }
        }
        column.arrayItemsType = columnType;
        column.arrayItemsLength = columnArrayLength;
        return true;
    };
    /**
     * Expands a specific row from the original results to number of rows specified in of 'arraySizes'
     * @param row - query result row
     * @param columns - query result columns
     * @param arraySizes - The number of new rows to create. This is the length of the timestamp array found.
     * @returns The new created rows.
     * Example:
     *
     *       Original row:
     *           ["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z"]       [10, 20]        Seg1
     *
     *       Transform to:
     *           "2016-11-10T06:00:00.0000000Z"        10          Seg1
     *           "2016-11-10T07:00:00.0000000Z"        20          Seg1
     */
    SeriesVisualize.prototype.expandRowForSeries = function (row, columns, arraySizes) {
        // Create an array of the new rows - each rows is initiazlized as an empty array
        var newRows = _.times(arraySizes, _.constant(0)).map(function () { return []; });
        for (var i = 0; i < columns.length; i++) {
            var column = columns[i];
            var value = row[i];
            // Expands the values - each in a new row
            if (column.validatedForSeries) {
                try {
                    // Extract the values and continue to next field
                    var values = JSON.parse(value);
                    for (var j = 0; j < arraySizes; j++) {
                        newRows[j].push(values[j]);
                    }
                    continue;
                }
                catch (ex) {
                    // Ignore
                }
            }
            // Copy the value from the original row
            for (var j = 0; j < arraySizes; j++) {
                newRows[j].push(value);
            }
        }
        return newRows;
    };
    /**
     * Expands all rows from the original result, each row to number of rows specified in of 'arraySizes'
     *
     * @param rows - query result rows
     * @param columns - query result columns
     * @param arraySizes - The number of new rows to create. This is the length of the timestamp array found.
     * @returns the new created rows.
     */
    SeriesVisualize.prototype.expandAllRowsForSeries = function (rows, columns, arraySizes) {
        var _this = this;
        var newRows = [];
        rows.forEach(function (row) {
            newRows = newRows.concat(_this.expandRowForSeries(row, columns, arraySizes));
        });
        return newRows;
    };
    /**
    * Returns the first index of an array which its value !== null.
    * @param valuesArray - array of values. can be strings,numbers ..
    * @returns number, the first index i that holds the equation "valuesArray[i] !== null" , returns 0 if the array is full with 'null' values.
    */
    SeriesVisualize.prototype.getFirstNotNullIndex = function (valuesArray) {
        for (var i = 0; i < valuesArray.length; i++) {
            if (valuesArray[i] !== null) {
                return i;
            }
        }
        return 0;
    };
    /**
     * Checks whether the results are in the form of series - based on the first row only.
     * Later, in tryResolveResultsAsSeries we'll verify that all rows are valid for the series.
     * This is the immediate check to avoid non-series results from parsing all inner values.
     * @param columns - query result columns
     * @param rows - query result rows
     * @returns True if the first row results are in the form of series.
     */
    SeriesVisualize.prototype.isSeriesPattern = function (columns, rows) {
        if (!rows || rows.length === 0 || !columns || columns.length === 0) {
            return {
                isSeries: false
            };
        }
        var firstRow = rows[0];
        var numberArraysIndices = [];
        var dateTimeArraysIndices = [];
        for (var i = 0; i < columns.length; i++) {
            var column = columns[i];
            if (column.type === chartModels_1.DraftColumnType.Dynamic) {
                var valuesArray = void 0;
                try {
                    valuesArray = JSON.parse(firstRow[i]);
                }
                catch (ex) {
                    // Value is not a valid json - return with no info about the field.
                    continue;
                }
                if (Array.isArray(valuesArray) && valuesArray.length > 0) {
                    var firstNotNullIndexOfArray = this.getFirstNotNullIndex(valuesArray);
                    var type = this.getItemFieldType(valuesArray[firstNotNullIndexOfArray]);
                    if (type === chartModels_1.DraftColumnType.DateTime) {
                        dateTimeArraysIndices.push(i);
                    }
                    else if (type === chartModels_1.DraftColumnType.Real) {
                        numberArraysIndices.push(i);
                    }
                }
            }
        }
        return {
            isSeries: dateTimeArraysIndices.length > 0 && numberArraysIndices.length > 0,
            dateTimeIndices: dateTimeArraysIndices,
            numberIndecies: numberArraysIndices
        };
    };
    /**
     * Add a new column to the results - this column will seperate the different series.
     * Each series will have different value for this column.
     * This column should be added only if there is no other column that can be used for split.
     * @param rows - query result rows
     * @param columns - query result columns
     */
    SeriesVisualize.prototype.addSeriesColumn = function (rows, columns) {
        var seriesColumn = {
            name: 'time_series',
            type: chartModels_1.DraftColumnType.String
        };
        columns.push(seriesColumn);
        rows.forEach(function (row, index) {
            row.push('timeSeries_' + (index + 1));
        });
    };
    return SeriesVisualize;
}());
exports.SeriesVisualize = SeriesVisualize;
//# sourceMappingURL=seriesVisualize.js.map