import { expectMetrics } from '../../../helpers';

describe('After running stryker on jest-react-enzyme-ts project', () => {
  it('should report expected scores', async () => {
    await expectMetrics({
      killed: 2,
      survived: 0,
      timeout: 0,
      compileErrors: 0,
      ignored: 0
    });
  });
});
