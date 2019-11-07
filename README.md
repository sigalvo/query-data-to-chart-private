# ** This package is a work in process. Please DO NOT USE it yet **

[![Build Status](https://travis-ci.org/sigalvo/query-data-to-chart-private.svg?branch=master)](https://travis-ci.org/sigalvo/query-data-to-chart-private)

# query-data-to-chart-private
Draw charts from Kusto query data

## Installation 
npm install query-data-to-chart-private

## Usage
```typescript
import * as Charts from 'query-data-to-chart-private';

const chartHelper = new Charts.KustoChartHelper();
const chartOptions: Charts.IChartOptions = {
    chartType: Charts.ChartType.Column,
    columnsSelection: {
        xAxis: { name: 'timestamp', type: Charts.DraftColumnType.DateTime },
        yAxes: [{ name: 'requestCount', type: Charts.DraftColumnType.Int }]
    }
};
const transformed: Charts.ITransformedQueryResultData = chartHelper.transformQueryResultData(queryResult.data, chartOptions);
```

## Test
Unit tests are written using [Jest](https://jestjs.io/).

```sh
Run tests: npm run test
```