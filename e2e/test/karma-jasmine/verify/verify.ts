import { expectScoreResult } from '../../../helpers';

describe('Verify stryker has ran correctly', () => {

  it('should report correct score', async () => {
    await expectScoreResult({
      killed: 16,
      mutationScore: 64,
      survived: 9
    });
  });
});
