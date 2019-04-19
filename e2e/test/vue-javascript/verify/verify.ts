import { expectMetricsResult, produceMetrics } from '../../../helpers';

describe('After running stryker on VueJS project', () => {
  it('should report 25% mutation score', async () => {
    await expectMetricsResult({
      metrics: produceMetrics({
        killed: 4,
        mutationScore: 25,
        survived: 12
      })
    });
  });
});
