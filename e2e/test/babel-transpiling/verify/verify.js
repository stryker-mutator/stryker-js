import { expectMetricsJsonToMatchSnapshot } from '../../../helpers.js';

describe('Verify stryker has ran correctly', () => {
  it('should report expected score', async () => {
    await expectMetricsJsonToMatchSnapshot();
  });
});
