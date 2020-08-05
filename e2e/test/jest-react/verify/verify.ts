import { expectMetricsResult, produceMetrics } from '../../../helpers';

describe('After running stryker on jest-react project', () => {
  it('should report expected scores', async () => {
    await expectMetricsResult({
      metrics: produceMetrics({
        killed: 27,
        timeout: 0,
        mutationScore: 65.85,
        mutationScoreBasedOnCoveredCode: 65.85,
        survived: 14,
        totalCovered: 41,
        totalDetected: 27,
        totalMutants: 41,
        totalUndetected: 14,
        totalValid: 41
      }),
    });
    /*
    ---------------|---------|----------|-----------|------------|----------|---------|
    File           | % score | # killed | # timeout | # survived | # no cov | # error |
    ---------------|---------|----------|-----------|------------|----------|---------|
    All files      |   65.85 |       27 |         0 |         14 |        0 |       0 |*/
  });
});
