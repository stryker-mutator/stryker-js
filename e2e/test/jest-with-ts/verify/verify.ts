import { expectMetrics } from '../../../helpers';

describe('Verify stryker has ran correctly', () => {

  it('should report correct score', async () => {
    await expectMetrics({
      ignored: 0,
      killed: 15,
      mutationScore: 53.57,
      noCoverage: 0,
      survived: 13,
      timeout: 0,
      compileErrors: 32
    });
  });
});
