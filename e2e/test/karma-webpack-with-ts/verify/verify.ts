import { expectMetrics } from '../../../helpers';

describe('Verify stryker has ran correctly', () => {

  it('should report correct score', async () => {
    await expectMetrics({
      mutationScore: 51.67,
      compileErrors: 0,
      ignored: 0,
      killed: 30,
      noCoverage: 15,
      runtimeErrors: 0,
      timeout: 1,
      survived: 14
    });
  });
});
