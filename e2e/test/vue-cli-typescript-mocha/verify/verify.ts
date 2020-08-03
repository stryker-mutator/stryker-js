import { expectMetrics } from '../../../helpers';

describe('Verify stryker has ran correctly', () => {

  it('should report correct score', async () => {
    await expectMetrics({
      killed: 2,
      survived: 1,
      noCoverage: 11,
      compileErrors: 3,
      runtimeErrors: 0,
      timeout: 0,
      mutationScore: 14.29
    });
  });
});
