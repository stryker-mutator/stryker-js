import { expectMetrics } from '../../../helpers';

describe('Verify stryker has ran correctly', () => {

  it('should report correct score', async () => {
    await expectMetrics({
      ignored: 0,
      killed: 17,
      mutationScore: 56.67,
      noCoverage: 0,
      survived: 13,
      timeout: 0,
      compileErrors: 32
    });
  });
});
