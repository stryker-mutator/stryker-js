import { expectMetricsResult, produceMetrics } from '../../../helpers';

describe('Verify stryker has ran correctly', () => {

  it('should report correct score', async () => {
    await expectMetricsResult({
      metrics: produceMetrics({
        compileErrors: 10,
        killed: 42,
        mutationScore: 75,
        mutationScoreBasedOnCoveredCode: 91.3,
        survived: 4,
        noCoverage: 10,
        totalCovered: 46,
        totalDetected: 42,
        totalMutants: 66,
        totalUndetected: 14,
        totalInvalid: 10,
        totalValid: 56
      })
    });
  });
});
