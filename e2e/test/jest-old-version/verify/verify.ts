
import { expectMetrics } from '../../../helpers';

describe('After running stryker with the lower bound version of jest', () => {
  it('should report 50% mutation score', async () => {
    await expectMetrics({
      killed: 3,
      mutationScore: 50,
      noCoverage: 2,
      survived: 1,
      timeout: 0
    });
  });
});
