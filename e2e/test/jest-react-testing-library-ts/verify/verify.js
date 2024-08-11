import { expectMetricsJsonToMatchSnapshot } from '../../../helpers.js';

describe('After running stryker on jest-react-enzyme-ts project', () => {
  it('should report expected scores', async () => {
    await expectMetricsJsonToMatchSnapshot();
  });
});
