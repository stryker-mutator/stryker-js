import { expectMetricsJson } from '../../../helpers';

describe('Verify stryker has ran correctly', () => {
  it('should report expected score', async () => {
    // File       | % score | # killed | # timeout | # survived | # no cov | # error |
    // All files  |   57.45 |       27 |         0 |         20 |        0 |       1 |
    await expectMetricsJson({
      killed: 27,
      mutationScore: 57.45,
      runtimeErrors: 1,
      survived: 20,
      noCoverage: 0,
    });
  });
});
