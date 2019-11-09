import { expectMetricsResult, produceMetrics } from '../../../helpers';

describe('After running stryker on angular project', () => {
  it('should report 15% or 7% mutation score', async () => {

    // Possible race condition: https://github.com/stryker-mutator/stryker/issues/1749
    try {
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
    } catch {
      await expectMetricsResult({
        metrics: produceMetrics({
          compileErrors: 0,
          killed: 1,
          mutationScore: 7.69,
          mutationScoreBasedOnCoveredCode: 7.69,
          noCoverage: 0,
          runtimeErrors: 2,
          survived: 12,
          timeout: 0,
          totalCovered: 13,
          totalDetected: 1,
          totalInvalid: 2,
          totalMutants: 15,
          totalUndetected: 12,
          totalValid: 13
        })
      });
    }
  });
});
