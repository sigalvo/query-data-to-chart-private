import { IQueryResultData } from '../common/chartModels';
export declare class SeriesVisualize {
    private static instance;
    private constructor();
    static getInstance(): SeriesVisualize;
    /**
     * Tries to resolve the results as series.
     * If the first row data doesn't match series result -> return immediately.
     * When succeeds to resolve as series, construct the new query data and return it.
     * @param queryResultData - The original query result data
     * @returns The series info with the updated query result data if the results are resolved as a series.
     *          In this case the results are updated by expanding the original queryResult.rows, and adding the series column if needed.
     *          Otherwise, returns null
     */
    tryResolveResultsAsSeries(queryResultData: IQueryResultData): IQueryResultData;
    private isDateTime;
    private getItemFieldType;
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
    private validateAndUpdateSeriesColumns;
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
    private validateAndUpdateSeriesColumn;
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
    private expandRowForSeries;
    /**
     * Expands all rows from the original result, each row to number of rows specified in of 'arraySizes'
     *
     * @param rows - query result rows
     * @param columns - query result columns
     * @param arraySizes - The number of new rows to create. This is the length of the timestamp array found.
     * @returns the new created rows.
     */
    private expandAllRowsForSeries;
    /**
    * Returns the first index of an array which its value !== null.
    * @param valuesArray - array of values. can be strings,numbers ..
    * @returns number, the first index i that holds the equation "valuesArray[i] !== null" , returns 0 if the array is full with 'null' values.
    */
    private getFirstNotNullIndex;
    /**
     * Checks whether the results are in the form of series - based on the first row only.
     * Later, in tryResolveResultsAsSeries we'll verify that all rows are valid for the series.
     * This is the immediate check to avoid non-series results from parsing all inner values.
     * @param columns - query result columns
     * @param rows - query result rows
     * @returns True if the first row results are in the form of series.
     */
    private isSeriesPattern;
    /**
     * Add a new column to the results - this column will seperate the different series.
     * Each series will have different value for this column.
     * This column should be added only if there is no other column that can be used for split.
     * @param rows - query result rows
     * @param columns - query result columns
     */
    private addSeriesColumn;
}
