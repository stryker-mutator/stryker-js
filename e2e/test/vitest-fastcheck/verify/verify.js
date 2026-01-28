import { expectMetricsJsonToMatchSnapshot } from '../../../helpers.js';

describe('Verify stryker has ran correctly', () => {
  it('should report correct score', async () => {
    await expectMetricsJsonToMatchSnapshot();
  });
});
