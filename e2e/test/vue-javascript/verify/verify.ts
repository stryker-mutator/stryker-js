import { expectMetricsResult, produceMetrics } from '../../../helpers';

describe('After running stryker on VueJS project', () => {
  it('should report 25% mutation score', async () => {
    await expectMetricsResult({
      metrics: produceMetrics({
        killed: 4,
        mutationScore: 29.41,
        mutationScoreBasedOnCoveredCode: 29.41,
        runtimeErrors: 0,
        survived: 12,
        timeout: 1,
        totalCovered: 17,
        totalDetected: 5,
        totalInvalid: 0,
        totalMutants: 17,
        totalUndetected: 12,
        totalValid: 17
      })
    });
  });
});
