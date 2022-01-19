import { expectMetrics } from '../../../helpers';

describe('Verify stryker has ran correctly', () => {

  it('should report correct score', async () => {
    await expectMetrics({
      mutationScore: 50.85,
      compileErrors: 0,
      ignored: 0,
      killed: 29,
      noCoverage: 15,
      runtimeErrors: 0,
      timeout: 1,
      survived: 14
    });
  });
});
