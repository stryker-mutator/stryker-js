import { expectMetricsResult, produceMetrics } from '../../../helpers';

describe('After running stryker on angular project', () => {
  it('should report 15% mutation score', async () => {
    await expectMetricsResult({
      metrics: produceMetrics({
        killed: 2,
        mutationScore: 15.38,
        mutationScoreBasedOnCoveredCode: 15.38,
        runtimeErrors: 2,
        survived: 11,
        totalCovered: 13,
        totalDetected: 2,
        totalInvalid: 2,
        totalMutants: 15,
        totalUndetected: 11,
        totalValid: 13
      })
    });
  });
});
