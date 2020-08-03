import { expectMetrics } from '../../../helpers';

describe('Verify stryker has ran correctly', () => {

  it('should report correct score', async () => {
    await expectMetrics({
      ignored: 0,
      killed: 12,
      mutationScore: 85.71,
      noCoverage: 2,
      survived: 0,
      timeout: 0,
      runtimeErrors: 0,
      compileErrors: 2
    });
  });
});
