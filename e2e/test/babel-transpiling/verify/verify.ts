import { expectMetricsResult, produceMetrics } from '../../../helpers';

describe('Verify stryker has ran correctly', () => {

  it('should report expected score', async () => {
    // File       | % score | # killed | # timeout | # survived | # no cov | # error |
    // All files  |   58.54 |       24 |         0 |         17 |        0 |       1 |
    await expectMetricsResult({
      metrics: produceMetrics({
        killed: 24,
        mutationScore: 58.54,
        runtimeErrors: 1,
        survived: 17
      })
    });
  });
});
