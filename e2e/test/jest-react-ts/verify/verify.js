import { expectMetricsJsonToMatchSnapshot } from '../../../helpers.js';

describe('After running stryker on jest-react-ts project', () => {
  it('should report expected scores', async () => {
    await expectMetricsJsonToMatchSnapshot();
  });
});
