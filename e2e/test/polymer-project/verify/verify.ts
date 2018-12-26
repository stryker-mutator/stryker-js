import { expect } from 'chai';
import { readScoreResult } from '../../../helpers';

describe('After running stryker on polymer-project', () => {
  it('should report expected values', async () => {
    const actualResult = await readScoreResult();
    /*
    File             | % score | # killed | # timeout | # survived | # no cov | # error |
    -----------------|---------|----------|-----------|------------|----------|---------|
    All files        |   88.24 |       14 |         1 |          2 |        0 |       0 |
    paper-button.js  |   88.24 |       14 |         1 |          2 |        0 |       0 |
    */
    expect({
      killed: actualResult.killed,
      mutationScore: parseFloat(actualResult.mutationScore.toFixed(2)),
      noCoverage: actualResult.noCoverage,
      survived: actualResult.survived,
      timedOut: actualResult.timedOut,
      totalMutants: actualResult.totalMutants
    }).deep.eq({
      killed: 14,
      mutationScore: 88.24,
      noCoverage: 0,
      survived: 2,
      timedOut: 1,
      totalMutants: 17
    });
  });
});
