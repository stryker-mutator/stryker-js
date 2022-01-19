import { expectMetricsJsonToMatchSnapshot } from '../../../helpers';

describe('After running stryker on a cucumber-ts project', () => {
  it('should report expected scores', async () => {
    await expectMetricsJsonToMatchSnapshot();
  });
});
