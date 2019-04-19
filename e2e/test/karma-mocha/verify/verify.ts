import { expectMetricsResult, produceMetrics } from '../../../helpers';

describe('Verify stryker has ran correctly', () => {

  it('should report correct score', async () => {
    await expectMetricsResult({
      metrics: produceMetrics({
        killed: 16,
        mutationScore: 64,
        mutationScoreBasedOnCoveredCode: 84.21,
        noCoverage: 6,
        survived: 3,
        totalCovered: 19,
        totalDetected: 16,
        totalMutants: 25,
        totalUndetected: 9,
        totalValid: 25
      })
    });
  });
});
