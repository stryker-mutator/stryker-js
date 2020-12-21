import { expectMetricsResult, produceMetrics } from '../../../helpers';

describe('After running stryker on jest-react project', () => {
  it('should report expected scores', async () => {
    await expectMetricsResult({
      metrics: produceMetrics({
        killed: 32,
        timeout: 0,
        mutationScore: 66.67,
        mutationScoreBasedOnCoveredCode: 66.67,
        survived: 16,
        totalCovered: 48,
        totalDetected: 32,
        totalMutants: 48,
        totalUndetected: 16,
        totalValid: 48
      }),
    });
    /*
      ---------------|---------|----------|-----------|------------|----------|---------|
      File           | % score | # killed | # timeout | # survived | # no cov | # error |
      ---------------|---------|----------|-----------|------------|----------|---------|
      All files      |   66.67 |       32 |         0 |         16 |        0 |       0 |*/
  });
});
