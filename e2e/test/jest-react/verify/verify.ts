import { expectMetricsResult, produceMetrics } from '../../../helpers';

describe('After running stryker on jest-react project', () => {
  it('should report expected scores', async () => {
    await expectMetricsResult({
      metrics: produceMetrics({
        killed: 34,
        mutationScore: 64.15,
        survived: 19,
        totalMutants: 53
      }),
    });
    /*
    ---------------|---------|----------|-----------|------------|----------|---------|
    File           | % score | # killed | # timeout | # survived | # no cov | # error |
    ---------------|---------|----------|-----------|------------|----------|---------|
    All files      |   64.15 |       34 |         0 |         19 |        0 |       0 |
    ---------------|---------|----------|-----------|------------|----------|---------|*/
  });
});
