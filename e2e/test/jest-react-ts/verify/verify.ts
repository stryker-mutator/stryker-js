import { expectMetrics } from '../../../helpers';

describe('After running stryker on jest-react project', () => {
  it('should report expected scores', async () => {
    await expectMetrics({
      survived: 53,
      killed: 53,
      timeout: 6,
      noCoverage: 0
    });
  });
});
