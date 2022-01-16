import { expectMetricsJson } from '../../../helpers';

describe('Verify stryker has ran correctly', () => {
  it('should report correct score', async () => {
    await expectMetricsJson({
      killed: 17,
      noCoverage: 5,
    });
  });
});
