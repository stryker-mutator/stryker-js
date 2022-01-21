import { expectMetricsJson } from '../../../helpers';

describe('After running stryker on a cucumber-ts project', () => {
  it('should report expected scores', async () => {
    await expectMetricsJson({
      killed: 64,
      ignored: 0,
      survived: 40,
      timeout: 1,
      noCoverage: 39,
      runtimeErrors: 16,
      mutationScore: 45.14,
    });
    /*
    -----------|---------|----------|-----------|------------|----------|---------|
    File       | % score | # killed | # timeout | # survived | # no cov | # error |
    -----------|---------|----------|-----------|------------|----------|---------|
    All files  |   45.14 |       64 |         1 |         40 |       39 |      16 |
    -----------|---------|----------|-----------|------------|----------|---------|*/
  });
});
