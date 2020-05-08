import { expectMetrics } from '../../../helpers';

describe('Verify stryker has ran correctly', () => {

  it('should report correct score', async () => {
    await expectMetrics({
      ignored: 0,
      killed: 12,
      mutationScore: 54.55,
      noCoverage: 0,
      survived: 10,
      timeout: 0,
      runtimeErrors: 32
    });
  });
});
