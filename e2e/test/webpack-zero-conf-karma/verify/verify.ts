import { expectMetrics } from '../../../helpers';

describe('Verify stryker has ran correctly', () => {

  it('should report correct score', async () => {
    await expectMetrics({
      compileErrors: 0,
      killed: 2,
      mutationScore: 33.33,
      mutationScoreBasedOnCoveredCode: 100,
      survived: 0,
      noCoverage: 4,
      timeout: 0
    });
  });
});
