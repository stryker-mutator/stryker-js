import { expectScoreResult } from '../../../helpers';

describe('After running stryker on angular project', () => {
  it('should report 15% mutation score', async () => {
    await expectScoreResult({
      killed: 2,
      mutationScore: 15.38,
      runtimeErrors: 2,
      survived: 11,
      timedOut: 0
    });
  });
});
