import { IChartHelper, IQueryResultData, ChartType, ISupportedColumnTypes, ISupportedColumns, IColumnsSelection, IChartOptions } from '../common/chartModels';
import { LimitedResults } from '../transformers/limitVisResults';
export interface ITransformedQueryResultData {
    data: IQueryResultData;
    limitedResults: LimitedResults;
}
export declare class KustoChartHelper implements IChartHelper {
    private static readonly maxDefaultYAxesSelection;
    private static readonly defaultChartOptions;
    private queryResultData;
    transformedQueryResultData: IQueryResultData;
    isResolveAsSeries: boolean;
    draw(queryResultData: IQueryResultData, options: IChartOptions): void;
    getSupportedColumnTypes(chartType: ChartType): ISupportedColumnTypes;
    getSupportedColumnsInResult(queryResultData: IQueryResultData, chartType: ChartType): ISupportedColumns;
    getDefaultSelection(queryResultData: IQueryResultData, chartType: ChartType, supportedColumnsForChart?: ISupportedColumns): IColumnsSelection;
    /**
    * Convert the query result data to an object that the chart can be drawn with.
    * @param queryResultData Original query result data
    * @param chartOptions
    * @returns transformed data if the transformation succeeded. Otherwise - returns null
    */
    transformQueryResultData(queryResultData: IQueryResultData, chartOptions: IChartOptions): ITransformedQueryResultData;
    private tryResolveResultsAsSeries;
    private getSupportedColumns;
    private selectDefaultXAxis;
    private selectDefaultYAxes;
    private selectDefaultSplitByColumn;
    private getColumnIndex;
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
    private addColumnsIfExistInResult;
    private updateDefaultChartOptions;
}
