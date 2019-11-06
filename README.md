# query-data-to-chart-private
Draw charts from Kusto query data

## Installation 
npm install query-data-to-chart-private

## Usage
### TypeScript
```typescript
import { KustoChartHelper, ITransformedQueryResultData, ChartType, DraftColumnType } from 'query-data-to-chart-private';

const chartHelper = new KustoChartHelper();
const chartOptions: IChartOptions = {
    chartType: ChartType.Column,
    columnsSelection: {
        xAxis: { name: 'timestamp', type: DraftColumnType.DateTime },
        yAxes: [{ name: 'requestCount', type: DraftColumnType.Int }]
    }
};

const transformed: ITransformedQueryResultData = this.chartHelper.transformQueryResultData(this.queryResult.data, chartOptions);

```
```sh
The original query response data will be transformed
```
### AMD
```javascript
define(function(require,exports,module){
  var pluralise = require('mypluralize');
});
```
## Test 
```sh
npm run test
```