import { expectMetricsJsonToMatchSnapshot } from '../../../helpers.js';

describe('After running stryker on a cucumber-ts project', () => {
  it('should report expected scores', async () => {
    await expectMetricsJsonToMatchSnapshot();
  });
});
