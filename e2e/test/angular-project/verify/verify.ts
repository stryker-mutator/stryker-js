import { expectMetricsJsonToMatchSnapshot } from '../../../helpers';

describe('After running stryker on angular project', () => {
  it('should report mutation score', async () => {
    await expectMetricsJsonToMatchSnapshot();
  });
});
