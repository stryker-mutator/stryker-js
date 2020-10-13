import { expectMetrics } from '../../../helpers';

describe('After running stryker on angular project', () => {
  it('should report mutation score', async () => {
    await expectMetrics({
      mutationScore: 42.86,
      killed: 3,
      survived: 0,
      noCoverage: 4,
      compileErrors: 0,
    })
    //  -------------------|---------|----------|-----------|------------|----------|---------|
    //  File               | % score | # killed | # timeout | # survived | # no cov | # error |
    //  -------------------|---------|----------|-----------|------------|----------|---------|
    //  All files          |   42.86 |        3 |         0 |          0 |        4 |       0 |
  });
});
