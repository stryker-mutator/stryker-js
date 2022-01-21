import { expectMetricsJson } from '../../../helpers';

describe('After running stryker on jest-react-ts project', () => {
  it('should report expected scores', async () => {
    await expectMetricsJson({
      killed: 61,
      noCoverage: 18,
      survived: 24,
      timeout: 5,
    });
  });
});
