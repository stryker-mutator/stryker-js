import { expectMetrics } from '../../../helpers';

describe('After running stryker on VueJS project', () => {
  it('should report ~29% mutation score', async () => {
    await expectMetrics({
      killed: 4,
      mutationScore: 29.41,
      mutationScoreBasedOnCoveredCode: 41.67,
      runtimeErrors: 0,
      noCoverage: 5,
      survived: 7,
      timeout: 1,
      totalCovered: 12,
      totalDetected: 5,
      totalInvalid: 0,
      totalMutants: 17,
      totalUndetected: 12,
      totalValid: 17
    });
  });
});
