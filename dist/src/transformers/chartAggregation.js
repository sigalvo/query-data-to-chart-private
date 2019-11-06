define(["require", "exports", "../common/chartModels"], function (require, exports, chartModels_1) {
    'use strict';
    var _a;
    Object.defineProperty(exports, "__esModule", { value: true });
    var ChartAggregation = /** @class */ (function () {
        function ChartAggregation() {
        }
        //#region Private members
        //#region Public methods
        ChartAggregation.getAggregationMethod = function (aggregationType) {
            var aggregationTypeToMethod = ChartAggregation.aggregationTypeToMethod;
            return aggregationTypeToMethod[aggregationType] || aggregationTypeToMethod[chartModels_1.AggregationType.Sum];
        };
        //#endregion Public methods
        //#region Aggregation methods
        ChartAggregation.sum = function (values) {
            var sum = 0;
            values.forEach(function (value) {
                sum += value;
            });
            return sum;
        };
        ChartAggregation.average = function (values) {
            var sum = ChartAggregation.sum(values);
            return sum / values.length;
        };
        ChartAggregation.minimum = function (values) {
            return Math.min.apply(Math, values);
        };
        ChartAggregation.maximum = function (values) {
            return Math.max.apply(Math, values);
        };
        //#region Private members
        ChartAggregation.aggregationTypeToMethod = (_a = {},
            _a[chartModels_1.AggregationType.Sum] = ChartAggregation.sum,
            _a[chartModels_1.AggregationType.Average] = ChartAggregation.average,
            _a[chartModels_1.AggregationType.Min] = ChartAggregation.minimum,
            _a[chartModels_1.AggregationType.Max] = ChartAggregation.maximum,
            _a);
        return ChartAggregation;
    }());
    exports.ChartAggregation = ChartAggregation;
});
//# sourceMappingURL=chartAggregation.js.map