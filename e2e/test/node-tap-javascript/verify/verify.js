import { expectMetricsJsonToMatchSnapshot } from '../../../helpers.js';

describe('After running stryker with the tap test runner', () => {
  it('should report 64% mutation score', async () => {
    await expectMetricsJsonToMatchSnapshot();
  });
});
