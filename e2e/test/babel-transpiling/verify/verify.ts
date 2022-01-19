import { expectMetricsJsonToMatchSnapshot } from '../../../helpers';

describe('Verify stryker has ran correctly', () => {
  it('should report expected score', async () => {
    await expectMetricsJsonToMatchSnapshot();
  });
});
