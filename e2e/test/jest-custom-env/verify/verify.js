import { expectMetricsJsonToMatchSnapshot } from '../../../helpers.js';

describe('After running stryker with test runner jest on test environment "node"', () => {
  it('should report 75% mutation score', async () => {
    await expectMetricsJsonToMatchSnapshot();
  });
});
