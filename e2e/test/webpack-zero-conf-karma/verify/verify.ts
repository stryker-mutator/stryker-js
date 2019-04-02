import { expectScoreResult } from '../../../helpers';

describe('Verify stryker has ran correctly', () => {

  it('should report correct score', async () => {
    await expectScoreResult({
      killed: 2,
      runtimeErrors: 0,
      survived: 4,
      transpileErrors: 3
    });
  });
});
