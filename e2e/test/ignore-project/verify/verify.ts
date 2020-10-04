import { expectMetrics } from '../../../helpers';

describe('After running stryker on jest-react project', () => {
  it('should report expected scores', async () => {
    await expectMetrics({
      killed: 8,
      ignored: 13,
      mutationScore: 66.67,
    });
    /*
-----------|---------|----------|-----------|------------|----------|---------|
File       | % score | # killed | # timeout | # survived | # no cov | # error |
-----------|---------|----------|-----------|------------|----------|---------|
All files  |   66.67 |        8 |         0 |          0 |        4 |       0 |*/
  });
});
