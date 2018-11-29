import { expect } from 'chai';
import { readScoreResult } from '../../../helpers';

describe('After running stryker on jest-react project', () => {
  it('should report expected scores', async () => {
    const actualResult = await readScoreResult();
    expect(actualResult.childResults).lengthOf(3);
    expect({
      killed: actualResult.killed,
      mutationScore: parseFloat(actualResult.mutationScore.toFixed(2)),
      noCoverage: actualResult.noCoverage,
      survived: actualResult.survived,
      timedOut: actualResult.timedOut,
      totalMutants: actualResult.totalMutants
    }).deep.eq({
      killed: 34,
      mutationScore: 64.15,
      noCoverage: 0,
      survived: 19,
      timedOut: 0,
      totalMutants: 53,
    });
    /*
    ---------------|---------|----------|-----------|------------|----------|---------|
    File           | % score | # killed | # timeout | # survived | # no cov | # error |
    ---------------|---------|----------|-----------|------------|----------|---------|
    All files      |   64.15 |       34 |         0 |         19 |        0 |       0 |
    ---------------|---------|----------|-----------|------------|----------|---------|*/
  });
});
