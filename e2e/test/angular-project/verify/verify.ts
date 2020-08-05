import { expectMetrics } from '../../../helpers';

describe('After running stryker on angular project', () => {
  it('should report 20% or 7% mutation score', async () => {
    await expectMetrics({
      mutationScore: 33.33,
      killed: 2,
      survived: 4,
      noCoverage: 0,
      compileErrors: 1,
    })
    //  -------------------|---------|----------|-----------|------------|----------|---------|
    //  File               | % score | # killed | # timeout | # survived | # no cov | # error |
    //  -------------------|---------|----------|-----------|------------|----------|---------|
    //  All files          |   20.00 |        1 |         0 |          4 |        0 |       0 |
  });
});
