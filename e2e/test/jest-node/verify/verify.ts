
import { expectMetricsResult, produceMetrics } from '../../../helpers';

describe('After running stryker with test runner jasmine, test framework jasmine', () => {
  it('should report 75% mutation score', async () => {
    await expectMetricsResult({
      metrics: produceMetrics({
        killed: 3,
        mutationScore: 75,
        mutationScoreBasedOnCoveredCode: 75,
        noCoverage: 0,
        survived: 1,
        totalCovered: 4,
        totalDetected: 3,
        totalMutants: 4,
        totalUndetected: 1,
        totalValid: 4
      })
    });
  });
});
