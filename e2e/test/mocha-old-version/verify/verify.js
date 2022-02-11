import { expectMetricsJsonToMatchSnapshot } from '../../../helpers.js';

describe('Verify stryker runs on the lowest supported mocha version', () => {
  it('should have run correctly', () => {
    expectMetricsJsonToMatchSnapshot();
  });
});
