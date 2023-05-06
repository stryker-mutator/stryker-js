import { expectMetricsJsonToMatchSnapshot } from '../../../helpers.js';

describe('After running stryker --disallow-code-generation-from-strings', () => {
  it('should report the mutation score correctly', async () => {
    await expectMetricsJsonToMatchSnapshot();
  });
});
