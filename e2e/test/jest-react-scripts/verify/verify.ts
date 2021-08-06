import { expectMetricsJson } from '../../../helpers';

describe('After running stryker on jest-react project', () => {
  it('should report expected scores', async () => {
    await expectMetricsJson({
      killed: 32,
      timeout: 0,
      mutationScore: 66.67,
      survived: 15,
      noCoverage: 1,
      runtimeErrors: 0,
      compileErrors: 0
    });
    /*
      ---------------|---------|----------|-----------|------------|----------|---------|
      File           | % score | # killed | # timeout | # survived | # no cov | # error |
      ---------------|---------|----------|-----------|------------|----------|---------|
      All files      |   66.67 |       32 |         0 |         15 |        1 |       0 |*/
  });
});
