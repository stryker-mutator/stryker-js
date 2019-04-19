import { expectMetricsResult, produceMetrics } from '../../../helpers';

describe('Verify stryker has ran correctly', () => {

  it('should report correct score', async () => {
    await expectMetricsResult({
      metrics: produceMetrics({
        killed: 16,
        mutationScore: 64,
        noCoverage: 6,
        survived: 3
      })
    });
  });
});
