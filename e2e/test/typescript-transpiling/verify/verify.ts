import { expectScoreResult } from '../../../helpers';

describe('Verify stryker has ran correctly', () => {

  it('should report correct score', async () => {
    await expectScoreResult({
      killed: 18,
      mutationScore: 66.67,
      survived: 9
    });
  });
});
