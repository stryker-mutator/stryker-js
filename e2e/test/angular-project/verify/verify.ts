import { expectMetrics } from '../../../helpers';

describe('After running stryker on angular project', () => {
  it('should report mutation score', async () => {
    await expectMetrics({
      mutationScore: 33.33,
      killed: 2,
      survived: 0,
      noCoverage: 4,
      compileErrors: 0,
    });
    //  -------------------|---------|----------|-----------|------------|----------|---------|
    //  File               | % score | # killed | # timeout | # survived | # no cov | # error |
    //  -------------------|---------|----------|-----------|------------|----------|---------|
    //  All files          |   33.33 |        2 |         0 |          0 |        4 |       0 |
  });
});
