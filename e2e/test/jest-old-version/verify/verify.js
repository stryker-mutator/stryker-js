import { expectMetricsJsonToMatchSnapshot } from '../../../helpers.js';

describe('After running stryker with the lower bound version of jest', () => {
  it('should report 50% mutation score', async () => {
    await expectMetricsJsonToMatchSnapshot();
  });
});
