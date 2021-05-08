import { expectMetricsResult, produceMetrics } from '../../../helpers';

describe('Verify stryker has ran correctly', () => {

  it('should report correct score', async () => {
    await expectMetricsResult({
      metrics: produceMetrics({
        killed: 16,
        mutationScore: 64,
        mutationScoreBasedOnCoveredCode: 94.12,
        survived: 1,
        noCoverage: 8,
        totalCovered: 17,
        totalDetected: 16,
        totalMutants: 25,
        totalUndetected: 9,
        totalValid: 25
      })
    });
  });
});
