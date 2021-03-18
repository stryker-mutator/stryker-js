import { expectMetrics } from '../../../helpers';

describe('After running stryker on jest-react project', () => {
  it('should report expected scores', async () => {
    await expectMetrics({
      killed: 2,
      ignored: 0,
      survived: 1,
      mutationScore: 66.67,
    });
    /*
    -----------|---------|----------|-----------|------------|----------|---------|
    File       | % score | # killed | # timeout | # survived | # no cov | # error |
    -----------|---------|----------|-----------|------------|----------|---------|
    All files  |   66.67 |        2 |         0 |          1 |        0 |       0 |
     square.js |   66.67 |        2 |         0 |          1 |        0 |       0 |
    -----------|---------|----------|-----------|------------|----------|---------|*/
  });
});
