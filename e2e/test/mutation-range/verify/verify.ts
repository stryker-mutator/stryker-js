import { expectMetrics } from '../../../helpers';

describe('Verify stryker has ran correctly', () => {

  it('should report correct score', async () => {
    await expectMetrics({
      ignored: 0,
      killed: 2,
      mutationScore: 40,
      noCoverage: 0,
      survived: 3,
      timeout: 0,
      compileErrors: 0
    });
  });
});
