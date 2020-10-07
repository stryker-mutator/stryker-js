import { expectMetricsResult, produceMetrics } from '../../../helpers';

describe('After running stryker on jest-react project', () => {
  it('should report expected scores', async () => {
    await expectMetricsResult({
      metrics: produceMetrics({
        killed: 33,
        timeout: 0,
        mutationScore: 67.35,
        mutationScoreBasedOnCoveredCode: 67.35,
        survived: 16,
        totalCovered: 49,
        totalDetected: 33,
        totalMutants: 49,
        totalUndetected: 16,
        totalValid: 49
      }),
    });
    /*
      ---------------|---------|----------|-----------|------------|----------|---------|
      File           | % score | # killed | # timeout | # survived | # no cov | # error |
      ---------------|---------|----------|-----------|------------|----------|---------|
      All files      |   67.35 |       33 |         0 |         16 |        0 |       0 |*/
  });
});
