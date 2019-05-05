import { expectMetricsResult, produceMetrics } from '../../../helpers';

describe('After running stryker on VueJS project', () => {
  it('should report 25% mutation score', async () => {
    await expectMetricsResult({
      metrics: produceMetrics({
        killed: 4,
        mutationScore: 25,
        mutationScoreBasedOnCoveredCode: 25,
        runtimeErrors: 1,
        survived: 12,
        totalCovered: 16,
        totalDetected: 4,
        totalInvalid: 1,
        totalMutants: 17,
        totalUndetected: 12,
        totalValid: 16
      })
    });
  });
});
