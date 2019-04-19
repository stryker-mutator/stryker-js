import { expectMetricsResult, produceMetrics } from '../../../helpers';

describe('After running stryker on polymer-project', () => {
  it('should report expected values', async () => {
    await expectMetricsResult({
      metrics: produceMetrics({
        killed: 14,
        mutationScore: 88.24,
        survived: 2,
        timeout: 1,
        totalMutants: 17
      })
    });
    /*
    File             | % score | # killed | # timeout | # survived | # no cov | # error |
    -----------------|---------|----------|-----------|------------|----------|---------|
    All files        |   88.24 |       14 |         1 |          2 |        0 |       0 |
    paper-button.js  |   88.24 |       14 |         1 |          2 |        0 |       0 |
    */
  });
});
