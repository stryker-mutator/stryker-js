import { expectMetricsJsonToMatchSnapshot } from '../../../helpers';

describe('Verify stryker has ran correctly', () => {
  it('should report correct score', async () => {
    await expectMetricsJsonToMatchSnapshot();
  });
});
