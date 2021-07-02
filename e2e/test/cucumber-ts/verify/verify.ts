import { expectMetricsJson } from '../../../helpers';

describe('After running stryker on a cucumber-ts project', () => {
  it('should report expected scores', async () => {
    await expectMetricsJson({
      killed: 65,
      ignored: 0,
      survived: 48,
      noCoverage: 39,
      runtimeErrors: 16,
      mutationScore: 42.76,
    });
    /*
    -----------|---------|----------|-----------|------------|----------|---------|
    File       | % score | # killed | # timeout | # survived | # no cov | # error |
    -----------|---------|----------|-----------|------------|----------|---------|
    All files  |   42.76 |       65 |         0 |         48 |       39 |      16 |
    -----------|---------|----------|-----------|------------|----------|---------|*/
  });
});
