import { expectMetrics } from '../../../helpers';

describe('After running stryker on jest-react-ts project', () => {
  it('should report expected scores', async () => {
    await expectMetrics({
      killed: 63,
      noCoverage: 19,
      survived: 25,
      timeout: 5,
    });
  });
});
