import { expectMetrics } from '../../../helpers';

describe('Verify stryker has ran correctly', () => {

  it('should report correct score', async () => {
    await expectMetrics({
      ignored: 0,
      killed: 1,
      mutationScore: 100,
      noCoverage: 0,
      survived: 0,
      timeout: 0,
      runtimeErrors: 1
    });
  });
});
