'use strict';

//#region Imports

import * as _ from 'lodash';
import * as moment from 'moment';
import { DraftColumnType, IQueryResultData, AggregationType, IRow, IRowValue } from '../common/chartModels';
import { ChartAggregation, IAggregationMethod } from './chartAggregation';

//#endregion Imports

export class LimitedResults {
    public constructor(
        public rows: any[] = [],
        public orderedXValues: any[] = [],
        public isAggregationApplied: boolean = false,
        public isPartialData: boolean = false) { }
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

interface IInternalParams extends ILimitAndAggregateParams {
    aggregationMethod: IAggregationMethod;
}

interface IRowsTotalCount {
    limitedColumnValue: any;
    yValues: any[];
    totalYValue?: number;
}

interface IAggregationResult {
    rows: IRow[];
    isAggregated: boolean;
}

interface IAggregatedRowInfo {
    order: number; // We want to save the rows order after the aggregation
    transformedRow: IRow; // The x-axis value and the split-by values after aggregation and escaping (to avoid XSS)
    yValues: any[];
}

interface IRowsTotalCountHash { [key: string]: IRowsTotalCount }

export class _LimitVisResults {
    //#region Public methods

    public escapeStr(value: IRowValue): IRowValue {
        // Don't escape non-string or timestamp values
        if (typeof (value) !== 'string' || moment(value).isValid()) {
            return value;
        }

        return _.escape(value);
    }

    /**
     * 1. Remove rows when the number of unique X-axis values exceeds 'maxUniqueXValues'.
     *    The method will take the biggest 'maxUniqueXValues' X-axis values, and all other X-axis values will be summed and added as 'Others'
     * 2. Escape all row values to avoid XSS
     * 3. Perform aggregation on rows with the same X, Y, and SplitBy values.
     */
    public limitAndAggregateRows(params: ILimitAndAggregateParams): LimitedResults {
        const limitedResults = new LimitedResults();
        const aggregationMethod = ChartAggregation.getAggregationMethod(params.aggregationType);
        const internalParams: IInternalParams = { ...{ aggregationMethod: aggregationMethod }, ...params }

        this.limitAllRows(internalParams, limitedResults);
        this.aggregateAndEscapeRows(internalParams, limitedResults);

        // Sort the x-Axis only if it's a date time column
        if (params.xColumnType === DraftColumnType.DateTime) {
            limitedResults.rows = _.sortBy(limitedResults.rows, (row) => {
                return moment(row[0]).valueOf();
            });
        }

        return limitedResults;
    }

    //#endregion Public methods

    //#region Private methods

    private getHashCode(str: string): number {
        const strLength: number = str.length;

        if (strLength === 0) {
            return 0;
        }

        let hash: number = 0;

        for (let i = 0; i < strLength; i++) {
            const charCode: number = str.charCodeAt(i);

            hash = ((hash << 5) - hash) + charCode;
            hash |= 0; // Convert to 32bit integer
        }

        return hash;
    }

    private getKey(row: IRowValue[]): string {
        // Creating a key made of the x-field and the split-by-fields
        let key = '';
        const separator = '_';

        for (let columnIndex = 0; columnIndex < row.length; ++columnIndex) {
            const val = row[columnIndex] || '';

            key += val + separator;
        }

        const hashCode = this.getHashCode(key);

        return hashCode.toString();
    }

    private applyAggregation(aggregatedRowsInfo: IAggregatedRowInfo[], aggregationMethod: IAggregationMethod): IAggregationResult {
        const aggregatedRows = [];
        let aggregationApplied = false;

        aggregatedRowsInfo.forEach((aggregatedRowData: IAggregatedRowInfo) => {
            const aggregatedRow = aggregatedRowData.transformedRow;

            aggregatedRowData.yValues.forEach((yValues) => {
                // If any aggregation is applied, raise flag
                if (yValues.length > 1) {
                    aggregationApplied = true;
                }

                // In case there are no valid values, return undefined
                const aggregatedYValue = yValues.length > 0 ? aggregationMethod(yValues) : undefined;

                aggregatedRow.push(aggregatedYValue);
            });

            aggregatedRows.push(aggregatedRow);
        });

        return {
            rows: aggregatedRows,
            isAggregated: aggregationApplied
        }
    }

    private limitOriginalRows(params: IInternalParams, limitedResults: LimitedResults, indexOfLimitedColumn: number, rowsToDisplayHash: any, createOtherColumn: boolean = false): void {
        const otherRows = [];

        // All the rows that were limited, will be count as 'Other'
        if (createOtherColumn) {
            const otherRow: any = [];

            otherRow[indexOfLimitedColumn] = params.otherStr;
            params.indexesOfYColumns.forEach((yIndex) => {
                otherRow[yIndex] = [];
            });

            otherRows.push(otherRow);
        }

        const limitedRows = [];

        // Add only the rows with the biggest count, all others will we counted as the 'Other' row
        limitedResults.rows.forEach((row, i) => {
            if (rowsToDisplayHash.hasOwnProperty(row[indexOfLimitedColumn])) {
                limitedRows.push(row);
            } else {
                const rowClone = _.clone(row);

                if (createOtherColumn) {
                    const otherRow = otherRows[0];

                    params.indexesOfYColumns.forEach((yIndex) => {
                        otherRow[yIndex].push(row[yIndex]);
                    });
                } else {
                    rowClone[indexOfLimitedColumn] = params.otherStr;
                    otherRows.push(rowClone);
                }
            }
        });

        if (createOtherColumn) {
            const otherRow = otherRows[0];

            // Aggregate all Y Values
            params.indexesOfYColumns.forEach((yIndex) => {
                otherRow[yIndex] = params.aggregationMethod(otherRow[yIndex]);
            });
        }

        limitedResults.rows = limitedRows.concat(otherRows);
    }

    private limitRows(params: IInternalParams, limitedResults: LimitedResults, indexOfLimitedColumn: number, createOtherColumn: boolean = false): void {
        const rows = limitedResults.rows;

        if (rows.length <= params.maxUniqueXValues) {
            return;
        }

        const totalCountRowsHash: IRowsTotalCountHash = {};
        let totalCountRowsHashLength = 0;

        // Aggregate the total count for each unique value
        rows.forEach((row) => {
            const limitedColumnValue = row[indexOfLimitedColumn];
            const yValues = _.map(params.indexesOfYColumns, (yIndex: number) => {
                return row[yIndex];
            });

            if (!totalCountRowsHash.hasOwnProperty(limitedColumnValue)) {
                totalCountRowsHash[limitedColumnValue] = { limitedColumnValue: limitedColumnValue, yValues: yValues };
                totalCountRowsHashLength++;
            } else {
                const prevYValues = totalCountRowsHash[limitedColumnValue].yValues;

                totalCountRowsHash[limitedColumnValue].yValues = prevYValues.concat(yValues);
            }
        });

        if (totalCountRowsHashLength <= params.maxUniqueXValues) {
            return;
        }

        // Apply the aggregation for all the yValues of the same key
        for (const key in totalCountRowsHash) {
            if (totalCountRowsHash.hasOwnProperty(key)) {
                const totalCountRow = totalCountRowsHash[key];

                totalCountRow.totalYValue = params.aggregationMethod(totalCountRow.yValues);
            }
        }

        // Sort the unique values by the total count
        const sortedTotalCountRows = _.sortBy(totalCountRowsHash, (row: any) => {
            return (-1) * row.totalYValue;
        });

        // Leave only the biggest maxUniqueXValues unique values
        const rowsToDisplayArr: IRowsTotalCount[] = sortedTotalCountRows.splice(0, params.maxUniqueXValues);
        const rowsToDisplayHash = {};

        // Convert the limited total count array to a hash
        _.forEach(rowsToDisplayArr, (limitedTotalCountRow) => {
            rowsToDisplayHash[limitedTotalCountRow.limitedColumnValue] = true;
        });

        this.limitOriginalRows(params, limitedResults, indexOfLimitedColumn, rowsToDisplayHash, createOtherColumn);
    }

    private limitXValues(params: IInternalParams, limitedResults: LimitedResults): void {
        const originalRows = params.queryResultData.rows;

        limitedResults.rows = originalRows;
        limitedResults.isPartialData = false;

        // Don't limit DateTime X values
        if (params.xColumnType === DraftColumnType.DateTime) {
            return;
        }

        this.limitRows(params, limitedResults, /*indexOfLimitedColumn*/ params.indexOfXColumn, /*createOtherColumn*/ true);

        // Mark that the X values were limited
        if (limitedResults.rows.length < originalRows.length) {
            limitedResults.isPartialData = true;
        }
    }

    private limitAllRows(params: IInternalParams, limitedResults: LimitedResults): void {
        this.limitXValues(params, limitedResults);

        params.indexesOfSplitByColumns.forEach((indexOfSplitByColumn: number) => {
            this.limitRows(params, limitedResults, indexOfSplitByColumn);
        });
    }

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
    private aggregateAndEscapeRows(params: IInternalParams, limitedResults: LimitedResults): void {
        const aggregatedRowInfoMap: { [rowKey: string]: IAggregatedRowInfo } = {};

        limitedResults.rows.forEach((row: IRow, index: number) => {
            const xValue = row[params.indexOfXColumn];
            const transformedRow = [this.escapeStr(xValue)];

            // Add all split-by values
            params.indexesOfSplitByColumns.forEach((splitByIndex) => {
                transformedRow.push(this.escapeStr(row[splitByIndex]));
            });

            const key = this.getKey(transformedRow);

            if (!aggregatedRowInfoMap.hasOwnProperty(key)) {
                aggregatedRowInfoMap[key] = {
                    order: index, // We want to save the rows order after the aggregation
                    transformedRow: transformedRow, // Row containing the x-axis value and the split-by values
                    yValues: []
                };

                params.indexesOfYColumns.forEach((yValue) => {
                    aggregatedRowInfoMap[key].yValues.push([]);
                });
            }

            // Add the Y-values, to be later aggregated
            params.indexesOfYColumns.forEach((yIndex: number, i: number) => {
                const yValue = row[yIndex];

                // Ignore undefined/null values
                if (yValue != undefined) {
                    const yValues = aggregatedRowInfoMap[key].yValues[i];

                    yValues.push(this.escapeStr(yValue));
                }
            });
        });

        // Restore rows order
        const aggregatedRowInfo: IAggregatedRowInfo[] = _.sortBy(aggregatedRowInfoMap, 'order');
        const aggregationResult: IAggregationResult = this.applyAggregation(aggregatedRowInfo, params.aggregationMethod);

        limitedResults.orderedXValues = _.map(limitedResults.rows, (row) => {
             return row[params.indexOfXColumn];
        }) || [];

        limitedResults.isAggregationApplied = aggregationResult.isAggregated;
        limitedResults.rows = aggregationResult.rows;
    }

    //#endregion Private methods
}

/**
 * export a Singleton class
 */
export const LimitVisResultsSingleton = new _LimitVisResults();