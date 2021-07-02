import { expectMetricsJson } from '../../../helpers';

describe('After running stryker on a cucumber-ts project', () => {
  it('should report expected scores', async () => {
    await expectMetricsJson({
      killed: 4,
      ignored: 0,
      survived: 0,
      noCoverage: 2,
      runtimeErrors: 2,
      mutationScore: 66.67,
    });
    /*
----------------------|---------|----------|-----------|------------|----------|---------|
File                  | % score | # killed | # timeout | # survived | # no cov | # error |
----------------------|---------|----------|-----------|------------|----------|---------|
All files             |   66.67 |        4 |         0 |          0 |        2 |       2 |*/
  });
});
