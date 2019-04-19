import { expectMetricsResult, produceMetrics } from '../../../helpers';

describe('Verify stryker has ran correctly', () => {

  it('should report correct score', async () => {
    await expectMetricsResult({
      metrics: produceMetrics({
        compileErrors: 3,
        killed: 2,
        mutationScore: 33.33,
        mutationScoreBasedOnCoveredCode: 33.33,
        survived: 4,
        totalCovered: 6,
        totalDetected: 2,
        totalInvalid: 3,
        totalMutants: 9,
        totalUndetected: 4,
        totalValid: 6
      })
    });
  });
});
