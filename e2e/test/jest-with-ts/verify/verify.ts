import { expectMetricsJson } from '../../../helpers';

describe('Verify stryker has ran correctly', () => {
  it('should report correct score', async () => {
    await expectMetricsJson({
      ignored: 0,
      killed: 17,
      mutationScore: 62.96,
      noCoverage: 0,
      survived: 10,
      timeout: 0,
      compileErrors: 35,
    });
  });
});
