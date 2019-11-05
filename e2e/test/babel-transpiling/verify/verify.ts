import { expectMetricsResult, produceMetrics } from '../../../helpers';

describe('Verify stryker has ran correctly', () => {

  it('should report expected score', async () => {
    // File       | % score | # killed | # timeout | # survived | # no cov | # error |
    // All files  |   58.54 |       24 |         0 |         17 |        0 |       1 |
    await expectMetricsResult({
      metrics: produceMetrics({
        killed: 24,
        mutationScore: 55.81,
        mutationScoreBasedOnCoveredCode: 55.81,
        runtimeErrors: 2,
        survived: 19,
        totalCovered: 43,
        totalDetected: 24,
        totalInvalid: 2,
        totalMutants: 45,
        totalUndetected: 19,
        totalValid: 43
      })
    });
  });
});
