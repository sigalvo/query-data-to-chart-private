define(["require", "exports", "../src/transformers/seriesVisualize", "../src/common/chartModels"], function (require, exports, seriesVisualize_1, chartModels_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('Unit tests for series visualization class', function () {
        //#region Test models getters
        // Model that tests basic series.
        function getHappyTestParams() {
            var rows = [
                ['[1,2,3]', 'seg1', '["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z","2016-11-10T08:00:00.0000000Z"]', '[-473527419.17344036,-463977987.2103976,-454428555.24735489]'],
                ['[4,5,6]', 'seg2', '["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z","2016-11-10T08:00:00.0000000Z"]', '[-502175715.06256857,-492626283.0995258,-483076851.1364831]']
            ];
            var columns = [
                { type: chartModels_1.DraftColumnType.Dynamic, name: 'values1' },
                { type: chartModels_1.DraftColumnType.String, name: 'segment' },
                { type: chartModels_1.DraftColumnType.Dynamic, name: 'timestamp' },
                { type: chartModels_1.DraftColumnType.Dynamic, name: 'values2' }
            ];
            var expectedRows = [
                [1, 'seg1', '2016-11-10T06:00:00.0000000Z', -473527419.17344036],
                [2, 'seg1', '2016-11-10T07:00:00.0000000Z', -463977987.2103976],
                [3, 'seg1', '2016-11-10T08:00:00.0000000Z', -454428555.24735489],
                [4, 'seg2', '2016-11-10T06:00:00.0000000Z', -502175715.06256857],
                [5, 'seg2', '2016-11-10T07:00:00.0000000Z', -492626283.0995258],
                [6, 'seg2', '2016-11-10T08:00:00.0000000Z', -483076851.1364831]
            ];
            var expectedColumns = [
                { name: 'values1', type: chartModels_1.DraftColumnType.Real },
                { name: 'segment', type: chartModels_1.DraftColumnType.String },
                { name: 'timestamp', type: chartModels_1.DraftColumnType.DateTime },
                { name: 'values2', type: chartModels_1.DraftColumnType.Real }
            ];
            return {
                queryResultData: { rows: rows, columns: columns },
                expectedResults: { rows: expectedRows, columns: expectedColumns }
            };
        }
        // Model that tests non-series results - the info should not be changed.
        function getNonSeriesResultsTestParams() {
            var rows = [
                [2, 'seg1', '2016-11-10T06:00:00.0000000Z', '[-473527419.17344036,-463977987.2103976,-454428555.24735489'],
                [5, 'seg2', '2016-11-10T06:00:00.0000000Z', '[-502175715.06256857,-492626283.0995258,-483076851.1364831]']
            ];
            var columns = [
                { name: 'values1', type: chartModels_1.DraftColumnType.Real },
                { name: 'segment', type: chartModels_1.DraftColumnType.String },
                { name: 'timestamp', type: chartModels_1.DraftColumnType.DateTime },
                { name: 'values2', type: chartModels_1.DraftColumnType.Dynamic }
            ];
            return {
                queryResultData: { rows: rows, columns: columns },
                expectedResults: null
            };
        }
        // Model that test the addition of a segment column when such isn't exist.
        function getMissingSegmentTestParams() {
            var rows = [
                ['[1,2,3]', '["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z","2016-11-10T08:00:00.0000000Z"]', '[-473527419.17344036,-463977987.2103976,-454428555.24735489]']
            ];
            var columns = [
                { name: 'values1', type: chartModels_1.DraftColumnType.Dynamic },
                { name: 'timestamp', type: chartModels_1.DraftColumnType.Dynamic },
                { name: 'values2', type: chartModels_1.DraftColumnType.Dynamic }
            ];
            var expectedRows = [
                [1, '2016-11-10T06:00:00.0000000Z', -473527419.17344036],
                [2, '2016-11-10T07:00:00.0000000Z', -463977987.2103976],
                [3, '2016-11-10T08:00:00.0000000Z', -454428555.24735489]
            ];
            var expectedColumns = [
                { name: 'values1', type: chartModels_1.DraftColumnType.Real },
                { name: 'timestamp', type: chartModels_1.DraftColumnType.DateTime },
                { name: 'values2', type: chartModels_1.DraftColumnType.Real },
            ];
            return {
                queryResultData: { rows: rows, columns: columns },
                expectedResults: { rows: expectedRows, columns: expectedColumns }
            };
        }
        // Model that test that a segment column is not added even if one doesn't exist because the result only has one row.
        function getMissingSegmentButOneRowOnlyTestParams() {
            var rows = [
                ['[1,2,3]', '["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z","2016-11-10T08:00:00.0000000Z"]', '[-473527419.17344036,-463977987.2103976,-454428555.24735489]'],
                ['[4,5,6]', '["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z","2016-11-10T08:00:00.0000000Z"]', '[-502175715.06256857,-492626283.0995258,-483076851.1364831]']
            ];
            var columns = [
                { name: 'values1', type: chartModels_1.DraftColumnType.Dynamic },
                { name: 'timestamp', type: chartModels_1.DraftColumnType.Dynamic },
                { name: 'values2', type: chartModels_1.DraftColumnType.Dynamic }
            ];
            var expectedRows = [
                [1, '2016-11-10T06:00:00.0000000Z', -473527419.17344036, 'timeSeries_1'],
                [2, '2016-11-10T07:00:00.0000000Z', -463977987.2103976, 'timeSeries_1'],
                [3, '2016-11-10T08:00:00.0000000Z', -454428555.24735489, 'timeSeries_1'],
                [4, '2016-11-10T06:00:00.0000000Z', -502175715.06256857, 'timeSeries_2'],
                [5, '2016-11-10T07:00:00.0000000Z', -492626283.0995258, 'timeSeries_2'],
                [6, '2016-11-10T08:00:00.0000000Z', -483076851.1364831, 'timeSeries_2']
            ];
            var expectedColumns = [
                { name: 'values1', type: chartModels_1.DraftColumnType.Real },
                { name: 'timestamp', type: chartModels_1.DraftColumnType.DateTime },
                { name: 'values2', type: chartModels_1.DraftColumnType.Real },
                { name: 'time_series', type: chartModels_1.DraftColumnType.String }
            ];
            return {
                queryResultData: { rows: rows, columns: columns },
                expectedResults: { rows: expectedRows, columns: expectedColumns }
            };
        }
        /*
        * Model that test plugin V2 scenario - series
        */
        function getPluginV2WithSeriesTestParams() {
            var rows = [
                ['[1,2,3]', 'seg1', '["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z","2016-11-10T08:00:00.0000000Z"]', '[-473527419.17344036,-463977987.2103976,-454428555.24735489]'],
                ['[4,5,6]', 'seg2', '["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z","2016-11-10T08:00:00.0000000Z"]', '[-502175715.06256857,-492626283.0995258,-483076851.1364831]']
            ];
            var columns = [
                { name: 'values1', type: chartModels_1.DraftColumnType.Dynamic },
                { name: 'segment', type: chartModels_1.DraftColumnType.String },
                { name: 'timestamp', type: chartModels_1.DraftColumnType.Dynamic },
                { name: 'values2', type: chartModels_1.DraftColumnType.Dynamic }
            ];
            var expectedRows = [
                [1, 'seg1', '2016-11-10T06:00:00.0000000Z', -473527419.17344036],
                [2, 'seg1', '2016-11-10T07:00:00.0000000Z', -463977987.2103976],
                [3, 'seg1', '2016-11-10T08:00:00.0000000Z', -454428555.24735489],
                [4, 'seg2', '2016-11-10T06:00:00.0000000Z', -502175715.06256857],
                [5, 'seg2', '2016-11-10T07:00:00.0000000Z', -492626283.0995258],
                [6, 'seg2', '2016-11-10T08:00:00.0000000Z', -483076851.1364831]
            ];
            var expectedColumns = [
                { name: 'values1', type: chartModels_1.DraftColumnType.Real },
                { name: 'segment', type: chartModels_1.DraftColumnType.String },
                { name: 'timestamp', type: chartModels_1.DraftColumnType.DateTime },
                { name: 'values2', type: chartModels_1.DraftColumnType.Real }
            ];
            return {
                queryResultData: { rows: rows, columns: columns },
                expectedResults: { rows: expectedRows, columns: expectedColumns }
            };
        }
        /*
        * Model that test plugin V2 scenario - not series
        */
        function getPluginV2WithoutSeriesTestParams() {
            var rows = [
                [2, 'seg1', '2016-11-10T06:00:00.0000000Z', '[-473527419.17344036,-463977987.2103976,-454428555.24735489'],
                [5, 'seg2', '2016-11-10T06:00:00.0000000Z', '[-502175715.06256857,-492626283.0995258,-483076851.1364831]']
            ];
            var columns = [
                { name: 'values1', type: chartModels_1.DraftColumnType.Real },
                { name: 'segment', type: chartModels_1.DraftColumnType.String },
                { name: 'timestamp', type: chartModels_1.DraftColumnType.DateTime },
                { name: 'values2', type: chartModels_1.DraftColumnType.Dynamic }
            ];
            return {
                queryResultData: { rows: rows, columns: columns },
                expectedResults: null
            };
        }
        // Model that test scenario when no values array found - the info should not be changed.
        function getNoValuesTestParams() {
            var rows = [
                ['seg1', '["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z","2016-11-10T08:00:00.0000000Z"]'],
                ['seg2', '["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z","2016-11-10T08:00:00.0000000Z"]']
            ];
            var columns = [
                { name: 'segment', type: chartModels_1.DraftColumnType.String },
                { name: 'timestamp', type: chartModels_1.DraftColumnType.Dynamic },
            ];
            return {
                queryResultData: { rows: rows, columns: columns },
                expectedResults: null
            };
        }
        // Model that test scenario when no timestamp array found - the info should not be changed.
        function getNoTimestampTestParams() {
            var rows = [
                ['[1,2,3]', 'seg1', '[-473527419.17344036,-463977987.2103976,-454428555.24735489]'],
                ['[4,5,6]', 'seg2', '[-502175715.06256857,-492626283.0995258,-483076851.1364831]']
            ];
            var columns = [
                { name: 'values1', type: chartModels_1.DraftColumnType.Dynamic },
                { name: 'segment', type: chartModels_1.DraftColumnType.String },
                { name: 'values2', type: chartModels_1.DraftColumnType.Dynamic }
            ];
            return {
                queryResultData: { rows: rows, columns: columns },
                expectedResults: null
            };
        }
        // Model that tests that columns with array length that different from the timestamp array length - will be treated as string - copy the values for all rows.
        function getArrayWithNotSymmetricValuesTestParams() {
            var rows = [
                ['[1,2,3]', 'seg1', '["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z","2016-11-10T08:00:00.0000000Z"]', '[-473527419.17344036,-463977987.2103976,-454428555.24735489]'],
                ['[4,6]', 'seg2', '["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z","2016-11-10T08:00:00.0000000Z"]', '[-502175715.06256857,-492626283.0995258,-483076851.1364831]']
            ];
            var columns = [
                { name: 'values1', type: chartModels_1.DraftColumnType.Dynamic },
                { name: 'segment', type: chartModels_1.DraftColumnType.String },
                { name: 'timestamp', type: chartModels_1.DraftColumnType.Dynamic },
                { name: 'values2', type: chartModels_1.DraftColumnType.Dynamic }
            ];
            var expectedRows = [
                ['[1,2,3]', 'seg1', '2016-11-10T06:00:00.0000000Z', -473527419.17344036],
                ['[1,2,3]', 'seg1', '2016-11-10T07:00:00.0000000Z', -463977987.2103976],
                ['[1,2,3]', 'seg1', '2016-11-10T08:00:00.0000000Z', -454428555.24735489],
                ['[4,6]', 'seg2', '2016-11-10T06:00:00.0000000Z', -502175715.06256857],
                ['[4,6]', 'seg2', '2016-11-10T07:00:00.0000000Z', -492626283.0995258],
                ['[4,6]', 'seg2', '2016-11-10T08:00:00.0000000Z', -483076851.1364831]
            ];
            var expectedColumns = [
                { name: 'values1', type: chartModels_1.DraftColumnType.Dynamic },
                { name: 'segment', type: chartModels_1.DraftColumnType.String },
                { name: 'timestamp', type: chartModels_1.DraftColumnType.DateTime },
                { name: 'values2', type: chartModels_1.DraftColumnType.Real }
            ];
            return {
                queryResultData: { rows: rows, columns: columns },
                expectedResults: { rows: expectedRows, columns: expectedColumns }
            };
        }
        // Model that tests columns with array that contains item with different types - will be treated as string - copy the values for all rows.
        function getArrayWithDifferentTypesTestParams() {
            var rows = [
                ['[1,"2",3]', 'seg1', '["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z","2016-11-10T08:00:00.0000000Z"]', '[-473527419.17344036,-463977987.2103976,-454428555.24735489]'],
                ['[4,5,6]', 'seg2', '["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z","2016-11-10T08:00:00.0000000Z"]', '[-502175715.06256857,-492626283.0995258,-483076851.1364831]']
            ];
            var columns = [
                { name: 'values1', type: chartModels_1.DraftColumnType.Dynamic },
                { name: 'segment', type: chartModels_1.DraftColumnType.String },
                { name: 'timestamp', type: chartModels_1.DraftColumnType.Dynamic },
                { name: 'values2', type: chartModels_1.DraftColumnType.Dynamic }
            ];
            var expectedRows = [
                ['[1,"2",3]', 'seg1', '2016-11-10T06:00:00.0000000Z', -473527419.17344036],
                ['[1,"2",3]', 'seg1', '2016-11-10T07:00:00.0000000Z', -463977987.2103976],
                ['[1,"2",3]', 'seg1', '2016-11-10T08:00:00.0000000Z', -454428555.24735489],
                ['[4,5,6]', 'seg2', '2016-11-10T06:00:00.0000000Z', -502175715.06256857],
                ['[4,5,6]', 'seg2', '2016-11-10T07:00:00.0000000Z', -492626283.0995258],
                ['[4,5,6]', 'seg2', '2016-11-10T08:00:00.0000000Z', -483076851.1364831]
            ];
            var expectedColumns = [
                { name: 'values1', type: chartModels_1.DraftColumnType.Dynamic },
                { name: 'segment', type: chartModels_1.DraftColumnType.String },
                { name: 'timestamp', type: chartModels_1.DraftColumnType.DateTime },
                { name: 'values2', type: chartModels_1.DraftColumnType.Real }
            ];
            return {
                queryResultData: { rows: rows, columns: columns },
                expectedResults: { rows: expectedRows, columns: expectedColumns }
            };
        }
        // Model that tests scenario that has two timestamp arrays
        function getTwoTimestampArraysTestParams() {
            var rows = [
                ['[1,2,3]', 'seg1', '["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z","2016-11-10T08:00:00.0000000Z"]', '[-473527419.17344036,-463977987.2103976,-454428555.24735489]', '["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z","2016-11-10T08:00:00.0000000Z"]'],
                ['[4,5,6]', 'seg2', '["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z","2016-11-10T08:00:00.0000000Z"]', '[-502175715.06256857,-492626283.0995258,-483076851.1364831]', '["2016-11-10T06:00:00.0000000Z","2016-11-10T07:00:00.0000000Z","2016-11-10T08:00:00.0000000Z"]']
            ];
            var columns = [
                { name: 'values1', type: chartModels_1.DraftColumnType.Dynamic },
                { name: 'segment', type: chartModels_1.DraftColumnType.String },
                { name: 'timestamp', type: chartModels_1.DraftColumnType.Dynamic },
                { name: 'values2', type: chartModels_1.DraftColumnType.Dynamic },
                { name: 'timestamp2', type: chartModels_1.DraftColumnType.Dynamic }
            ];
            var expectedRows = [
                [1, 'seg1', '2016-11-10T06:00:00.0000000Z', -473527419.17344036, '2016-11-10T06:00:00.0000000Z'],
                [2, 'seg1', '2016-11-10T07:00:00.0000000Z', -463977987.2103976, '2016-11-10T07:00:00.0000000Z'],
                [3, 'seg1', '2016-11-10T08:00:00.0000000Z', -454428555.24735489, '2016-11-10T08:00:00.0000000Z'],
                [4, 'seg2', '2016-11-10T06:00:00.0000000Z', -502175715.06256857, '2016-11-10T06:00:00.0000000Z'],
                [5, 'seg2', '2016-11-10T07:00:00.0000000Z', -492626283.0995258, '2016-11-10T07:00:00.0000000Z'],
                [6, 'seg2', '2016-11-10T08:00:00.0000000Z', -483076851.1364831, '2016-11-10T08:00:00.0000000Z']
            ];
            var expectedColumns = [
                { name: 'values1', type: chartModels_1.DraftColumnType.Real },
                { name: 'segment', type: chartModels_1.DraftColumnType.String },
                { name: 'timestamp', type: chartModels_1.DraftColumnType.DateTime },
                { name: 'values2', type: chartModels_1.DraftColumnType.Real },
                { name: 'timestamp2', type: chartModels_1.DraftColumnType.DateTime }
            ];
            return {
                queryResultData: { rows: rows, columns: columns },
                expectedResults: { rows: expectedRows, columns: expectedColumns }
            };
        }
        //#endregion Test models getters
        //#region Private helper tests
        function areColumnsEqual(actualColumns, expectedColumns) {
            if (actualColumns.length !== expectedColumns.length) {
                return false;
            }
            for (var i = 0; i < actualColumns.length; i++) {
                var actualColumn = actualColumns[i];
                var expectedColumn = expectedColumns[i];
                if (actualColumn.name !== expectedColumn.name || actualColumn.type !== expectedColumn.type) {
                    return false;
                }
            }
            return true;
        }
        //#endregion Private helper tests
        //#region Tests suite
        function testTryResolveResultsAsSeries(getTestParamsFn, testName) {
            it('Testing tryResolveAsSeries ' + testName, function () {
                // Init
                var testParams = getTestParamsFn();
                var queryResultData = testParams.queryResultData;
                var expectedResults = testParams.expectedResults;
                // Act
                var seriesVisualize = seriesVisualize_1.SeriesVisualize.getInstance();
                var updatedResults = seriesVisualize.tryResolveResultsAsSeries(queryResultData);
                // Assert
                if (updatedResults) {
                    expect(updatedResults.rows).toEqual(expectedResults.rows);
                    expect(areColumnsEqual(updatedResults.columns, expectedResults.columns)).toEqual(true);
                }
                else {
                    expect(expectedResults).toEqual(null);
                }
            });
        }
        describe('Testing tryResolveResultsAsSeries', function () {
            testTryResolveResultsAsSeries(getHappyTestParams, 'HappyFlow');
            testTryResolveResultsAsSeries(getNonSeriesResultsTestParams, 'NonSeriesResults');
            testTryResolveResultsAsSeries(getMissingSegmentTestParams, 'MissingSegment');
            testTryResolveResultsAsSeries(getMissingSegmentButOneRowOnlyTestParams, 'MissingSegmentButOneRowOnly');
            testTryResolveResultsAsSeries(getPluginV2WithSeriesTestParams, 'V2PluginHappyFlow');
            testTryResolveResultsAsSeries(getPluginV2WithoutSeriesTestParams, 'V2PluginNoSeries');
            testTryResolveResultsAsSeries(getNoValuesTestParams, 'MissingValues');
            testTryResolveResultsAsSeries(getNoTimestampTestParams, 'MissingTimestamp');
            testTryResolveResultsAsSeries(getArrayWithNotSymmetricValuesTestParams, 'NotSymmetric');
            testTryResolveResultsAsSeries(getArrayWithDifferentTypesTestParams, 'WithDifferentTypes');
            testTryResolveResultsAsSeries(getTwoTimestampArraysTestParams, 'TwoTimestamps');
        });
        //#endregion Tests suite
    });
});
//# sourceMappingURL=seriesVisualize.test.js.map