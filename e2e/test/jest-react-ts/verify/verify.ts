import { expectMetrics } from '../../../helpers';

describe('After running stryker on jest-react project', () => {
  it('should report expected scores', async () => {
    await expectMetrics({
      survived: 45,
      killed: 46,
      timeout: 5,
      noCoverage: 0
    });
  });
});
