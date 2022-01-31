import { expectMetricsJsonToMatchSnapshot } from '../../../helpers';

describe('After running stryker on jest-react-ts project', () => {
  it('should report expected scores', async () => {
    await expectMetricsJsonToMatchSnapshot();
  });
});
