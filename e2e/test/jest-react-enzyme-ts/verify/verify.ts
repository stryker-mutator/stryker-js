import { expectMetricsJsonToMatchSnapshot } from '../../../helpers';

describe('After running stryker on jest-react-enzyme-ts project', () => {
  it('should report expected scores', async () => {
    await expectMetricsJsonToMatchSnapshot();
  });
});
