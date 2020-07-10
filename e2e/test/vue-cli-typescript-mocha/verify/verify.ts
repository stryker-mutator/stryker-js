import { expectMetrics } from '../../../helpers';

describe('Verify stryker has ran correctly', () => {

  it('should report correct score', async () => {
    await expectMetrics({
      killed: 4,
      survived: 1,
      noCoverage: 12,
      compileErrors: 0,
      runtimeErrors: 0,
      timeout: 0,
      mutationScore: 23.53
    });
  });
});
