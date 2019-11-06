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
define(["require", "exports", "./chartModels", "../transformers/seriesVisualize", "../transformers/limitVisResults"], function (require, exports, chartModels_1, seriesVisualize_1, limitVisResults_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var KustoChartHelper = /** @class */ (function () {
        function KustoChartHelper() {
            //#region Private members
            this.isResolveAsSeries = false;
            //#endregion Private methods
        }
        //#endregion Public members
        //#region Public methods
        KustoChartHelper.prototype.draw = function (queryResultData, options) {
            // TODO: Not implemented yet
        };
        KustoChartHelper.prototype.getSupportedColumnTypes = function (chartType) {
            switch (chartType) {
                case chartModels_1.ChartType.Pie:
                case chartModels_1.ChartType.Donut: {
                    return {
                        xAxis: [chartModels_1.DraftColumnType.String],
                        yAxis: [chartModels_1.DraftColumnType.Int, chartModels_1.DraftColumnType.Long, chartModels_1.DraftColumnType.Decimal, chartModels_1.DraftColumnType.Real],
                        splitBy: [chartModels_1.DraftColumnType.String, chartModels_1.DraftColumnType.DateTime, chartModels_1.DraftColumnType.Bool]
                    };
                }
                default: {
                    return {
                        xAxis: [chartModels_1.DraftColumnType.DateTime, chartModels_1.DraftColumnType.Int, chartModels_1.DraftColumnType.Long, chartModels_1.DraftColumnType.Decimal, chartModels_1.DraftColumnType.Real, chartModels_1.DraftColumnType.String],
                        yAxis: [chartModels_1.DraftColumnType.Int, chartModels_1.DraftColumnType.Long, chartModels_1.DraftColumnType.Decimal, chartModels_1.DraftColumnType.Real],
                        splitBy: [chartModels_1.DraftColumnType.String]
                    };
                }
            }
        };
        KustoChartHelper.prototype.getSupportedColumnsInResult = function (queryResultData, chartType) {
            var transformedQueryResultData = this.tryResolveResultsAsSeries(queryResultData);
            var supportedColumnTypes = this.getSupportedColumnTypes(chartType);
            return {
                xAxis: this.getSupportedColumns(transformedQueryResultData, supportedColumnTypes.xAxis),
                yAxis: this.getSupportedColumns(transformedQueryResultData, supportedColumnTypes.yAxis),
                splitBy: this.getSupportedColumns(transformedQueryResultData, supportedColumnTypes.splitBy)
            };
        };
        KustoChartHelper.prototype.getDefaultSelection = function (queryResultData, chartType, supportedColumnsForChart) {
            if (!supportedColumnsForChart) {
                supportedColumnsForChart = this.getSupportedColumnsInResult(queryResultData, chartType);
            }
            var defaultXAxis = this.selectDefaultXAxis(supportedColumnsForChart.xAxis);
            var defaultSplitBy = this.selectDefaultSplitByColumn(supportedColumnsForChart.splitBy, defaultXAxis, chartType);
            var defaultYAxes = this.selectDefaultYAxes(supportedColumnsForChart.yAxis, defaultXAxis, defaultSplitBy);
            return {
                xAxis: defaultXAxis,
                yAxes: defaultYAxes,
                splitBy: defaultSplitBy ? [defaultSplitBy] : null
            };
        };
        /**
        * Convert the query result data to an object that the chart can be drawn with.
        * @param queryResultData Original query result data
        * @param chartOptions
        * @returns transformed data if the transformation succeeded. Otherwise - returns null
        */
        KustoChartHelper.prototype.transformQueryResultData = function (queryResultData, chartOptions) {
            // Update the chart options with defaults for optional values that weren't provided
            chartOptions = this.updateDefaultChartOptions(chartOptions);
            var chartColumns = [];
            var indexOfXAxisColumn = [];
            if (!this.addColumnsIfExistInResult([chartOptions.columnsSelection.xAxis], queryResultData, indexOfXAxisColumn, chartColumns)) {
                return null;
            }
            // Get all the indexes for all the splitBy columns
            var indexesOfSplitByColumns = [];
            if (!this.addColumnsIfExistInResult(chartOptions.columnsSelection.splitBy, queryResultData, indexesOfSplitByColumns, chartColumns)) {
                return null;
            }
            // Get all the indexes for all the y fields
            var indexesOfYAxes = [];
            if (!this.addColumnsIfExistInResult(chartOptions.columnsSelection.yAxes, queryResultData, indexesOfYAxes, chartColumns)) {
                return null;
            }
            // Create transformed rows for visualization
            var limitAndAggregateParams = {
                queryResultData: queryResultData,
                indexOfXColumn: indexOfXAxisColumn[0],
                indexesOfYColumns: indexesOfYAxes,
                indexesOfSplitByColumns: indexesOfSplitByColumns,
                xColumnType: chartOptions.columnsSelection.xAxis.type,
                aggregationType: chartOptions.aggregationType,
                maxUniqueXValues: chartOptions.maxUniqueXValues,
                otherStr: chartOptions.exceedMaxDataPointLabel
            };
            var limitedResults = limitVisResults_1.LimitVisResultsSingleton.limitAndAggregateRows(limitAndAggregateParams);
            return {
                data: {
                    rows: limitedResults.rows,
                    columns: chartColumns
                },
                limitedResults: limitedResults
            };
        };
        //#endregion Public methods
        //#region Private methods
        KustoChartHelper.prototype.tryResolveResultsAsSeries = function (queryResultData) {
            // Transform the query results only once
            if (this.queryResultData !== queryResultData) {
                this.queryResultData = queryResultData;
                this.transformedQueryResultData = queryResultData;
                // Tries to resolve the results as series
                var seriesVisualize = seriesVisualize_1.SeriesVisualize.getInstance();
                var updatedQueryResultData = seriesVisualize.tryResolveResultsAsSeries(queryResultData);
                if (updatedQueryResultData) {
                    this.isResolveAsSeries = true;
                    this.transformedQueryResultData = updatedQueryResultData;
                }
            }
            return this.transformedQueryResultData;
        };
        KustoChartHelper.prototype.getSupportedColumns = function (queryResultData, supportedTypes) {
            var supportedColumns = queryResultData.columns.filter(function (column) {
                return supportedTypes.indexOf(column.type) !== -1;
            });
            return supportedColumns;
        };
        KustoChartHelper.prototype.selectDefaultXAxis = function (supportedColumns) {
            if (!supportedColumns || supportedColumns.length === 0) {
                return null;
            }
            // Select the first DateTime column if exists
            for (var i = 0; i < supportedColumns.length; i++) {
                var column = supportedColumns[i];
                if (column.type === chartModels_1.DraftColumnType.DateTime) {
                    return column;
                }
            }
            // If DateTime column doesn't exist - select the first supported column
            return supportedColumns[0];
        };
        KustoChartHelper.prototype.selectDefaultYAxes = function (supportedColumns, selectedXAxis, selectedSplitBy) {
            if (!supportedColumns || supportedColumns.length === 0 || !selectedXAxis) {
                return null;
            }
            // Remove the selected XAxis and SplitBy columns from the supported columns
            var updatedSupportedColumns = supportedColumns.filter(function (column) {
                var isSelectedXAxis = column.name === selectedXAxis.name && column.type === selectedXAxis.type;
                var isSelectedSplitBy = selectedSplitBy && column.name === selectedSplitBy.name && column.type === selectedSplitBy.type;
                return !isSelectedXAxis && !isSelectedSplitBy;
            });
            if (updatedSupportedColumns.length === 0) {
                return null;
            }
            var numberOfDefaultYAxes = selectedSplitBy ? 1 : KustoChartHelper.maxDefaultYAxesSelection;
            var selectedYAxes = updatedSupportedColumns.slice(0, numberOfDefaultYAxes);
            return selectedYAxes;
        };
        KustoChartHelper.prototype.selectDefaultSplitByColumn = function (supportedColumns, selectedXAxis, chartType) {
            // Pie / Donut chart default is without a splitBy column
            if (!supportedColumns || supportedColumns.length === 0 || !selectedXAxis || chartType === chartModels_1.ChartType.Pie || chartType === chartModels_1.ChartType.Donut) {
                return null;
            }
            // Remove the selected XAxis column from the supported columns
            var updatedSupportedColumns = supportedColumns.filter(function (column) {
                return column.name !== selectedXAxis.name || column.type !== selectedXAxis.type;
            });
            if (updatedSupportedColumns.length > 0) {
                return updatedSupportedColumns[0];
            }
            return null;
        };
        // Returns the index of the column with the same name and type in the columns array
        KustoChartHelper.prototype.getColumnIndex = function (queryResultData, columnToFind) {
            var columns = queryResultData && queryResultData.columns;
            if (!columns) {
                return -1;
            }
            for (var i = 0; i < columns.length; i++) {
                var currentColumn = columns[i];
                if (currentColumn.name == columnToFind.name && currentColumn.type == columnToFind.type) {
                    return i;
                }
            }
            return -1;
        };
        /**
         * Search for certain columns in the 'queryResultData'. If the column exist:
         * 1. Add the column name and type to the 'chartColumns' array
         * 2. Add it's index in the queryResultData to the 'indexes' array
         * @param columnsToAdd - The columns that we want to search in the 'queryResultData'
         * @param queryResultData - The original query result data
         * @param indexes - The array that the existing columns index will be added to
         * @param chartColumns - The array that the existing columns will be added to
         *
         * @returns True if all the columns were found in 'queryResultData'
         */
        KustoChartHelper.prototype.addColumnsIfExistInResult = function (columnsToAdd, queryResultData, indexes, chartColumns) {
            for (var i = 0; i < columnsToAdd.length; ++i) {
                var column = columnsToAdd[i];
                var indexOfColumn = this.getColumnIndex(queryResultData, column);
                if (indexOfColumn < 0) {
                    return false;
                }
                indexes.push(indexOfColumn);
                // Add each column name and type to the chartColumns
                chartColumns.push({
                    name: limitVisResults_1.LimitVisResultsSingleton.escapeStr(column.name),
                    type: column.type
                });
            }
            return true;
        };
        KustoChartHelper.prototype.updateDefaultChartOptions = function (chartOptions) {
            var updatedChartOptions = __assign(__assign({}, KustoChartHelper.defaultChartOptions), chartOptions);
            return updatedChartOptions;
        };
        KustoChartHelper.maxDefaultYAxesSelection = 4;
        KustoChartHelper.defaultChartOptions = {
            chartType: chartModels_1.ChartType.Column,
            columnsSelection: undefined,
            maxUniqueXValues: 100,
            exceedMaxDataPointLabel: 'OTHER',
            aggregationType: chartModels_1.AggregationType.Sum
        };
        return KustoChartHelper;
    }());
    exports.KustoChartHelper = KustoChartHelper;
});
//# sourceMappingURL=kustoChartHelper.js.map