import { expectMetricsJson } from '../../../helpers';

describe('Verify stryker has ran correctly', () => {
  it('should report expected score', async () => {
    // File       | % score | # killed | # timeout | # survived | # no cov | # error |
    // All files  |   55.56 |       25 |         0 |         20 |        0 |       1 |
    await expectMetricsJson({
      killed: 25,
      mutationScore: 55.56,
      runtimeErrors: 1,
      survived: 20,
      noCoverage: 0,
    });
  });
});
