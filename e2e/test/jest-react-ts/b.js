const m = require('mutation-testing-metrics');
const r  =require ('./reports/mutation/events/00141-onMutationTestReportReady.json')
const s = m.calculateMetrics(r.files);
console.log(s);
