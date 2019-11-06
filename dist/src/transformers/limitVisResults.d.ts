import { DraftColumnType, IQueryResultData, AggregationType, IRowValue } from '../common/chartModels';
export declare class LimitedResults {
    rows: any[];
    orderedXValues: any[];
    isAggregationApplied: boolean;
    isPartialData: boolean;
    constructor(rows?: any[], orderedXValues?: any[], isAggregationApplied?: boolean, isPartialData?: boolean);
}
export interface ILimitAndAggregateParams {
    queryResultData: IQueryResultData;
    indexOfXColumn: number;
    indexesOfYColumns: number[];
    indexesOfSplitByColumns: number[];
    xColumnType: DraftColumnType;
    aggregationType: AggregationType;
    maxUniqueXValues: number;
    otherStr: string;
}
export declare class _LimitVisResults {
    escapeStr(value: IRowValue): IRowValue;
    /**
     * 1. Remove rows when the number of unique X-axis values exceeds 'maxUniqueXValues'.
     *    The method will take the biggest 'maxUniqueXValues' X-axis values, and all other X-axis values will be summed and added as 'Others'
     * 2. Escape all row values to avoid XSS
     * 3. Perform aggregation on rows with the same X, Y, and SplitBy values.
     */
    limitAndAggregateRows(params: ILimitAndAggregateParams): LimitedResults;
    private getHashCode;
    private getKey;
    private applyAggregation;
    private limitOriginalRows;
    private limitRows;
    private limitXValues;
    private limitAllRows;
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
    private aggregateAndEscapeRows;
}
/**
 * export a Singleton class
 */
export declare const LimitVisResultsSingleton: _LimitVisResults;
