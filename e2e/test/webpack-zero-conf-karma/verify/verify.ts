import { expectMetricsResult, produceMetrics } from '../../../helpers';

describe('Verify stryker has ran correctly', () => {

  it('should report correct score', async () => {
    await expectMetricsResult({
      metrics: produceMetrics({
        compileErrors: 3,
        killed: 2,
        survived: 4
      })
    });
  });
});
