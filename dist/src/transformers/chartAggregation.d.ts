import { AggregationType } from '../common/chartModels';
export declare type IAggregationMethod = (valuesToAggregate: number[]) => number;
export declare class ChartAggregation {
    private static aggregationTypeToMethod;
    static getAggregationMethod(aggregationType: AggregationType): IAggregationMethod;
    private static sum;
    private static average;
    private static minimum;
    private static maximum;
}
