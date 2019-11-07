'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
//#region Draft contracts
// See: https://kusto.azurewebsites.net/docs/query/scalar-data-types/index.html
var DraftColumnType;
(function (DraftColumnType) {
    DraftColumnType["Bool"] = "bool";
    DraftColumnType["DateTime"] = "datetime";
    DraftColumnType["Decimal"] = "decimal";
    DraftColumnType["Dynamic"] = "dynamic";
    DraftColumnType["Guid"] = "guid";
    DraftColumnType["Int"] = "int";
    DraftColumnType["Long"] = "long";
    DraftColumnType["Real"] = "real";
    DraftColumnType["String"] = "string";
    DraftColumnType["TimeSpan"] = "timespan";
})(DraftColumnType = exports.DraftColumnType || (exports.DraftColumnType = {}));
var ChartType;
(function (ChartType) {
    ChartType["Line"] = "Line";
    ChartType["Scatter"] = "Scatter";
    ChartType["Area"] = "Area";
    ChartType["StackedArea"] = "StackedArea";
    ChartType["PercentageArea"] = "PercentageArea";
    ChartType["Column"] = "Column";
    ChartType["StackedColumn"] = "StackedColumn";
    ChartType["PercentageColumn"] = "PercentageColumn";
    ChartType["Pie"] = "Pie";
    ChartType["Donut"] = "Donut";
})(ChartType = exports.ChartType || (exports.ChartType = {}));
var AggregationType;
(function (AggregationType) {
    AggregationType["Sum"] = "Sum";
    AggregationType["Average"] = "Average";
    AggregationType["Min"] = "Min";
    AggregationType["Max"] = "Max";
})(AggregationType = exports.AggregationType || (exports.AggregationType = {}));
//# sourceMappingURL=chartModels.js.map