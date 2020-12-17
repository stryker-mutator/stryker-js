
import { expectMetrics } from '../../../helpers';

describe('After running stryker with test runner jest on test environment "node"', () => {
  it('should report 75% mutation score', async () => {
    await expectMetrics({
      killed: 24,
      mutationScore: 75,
      noCoverage: 3,
      survived: 1,
    });
  });
});
