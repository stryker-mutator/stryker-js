import * as fs from 'mz/fs';
import { expect } from 'chai';
import { readScoreResult } from '../../../helpers';

describe('After running stryker with test runner jasmine, test framework jasmine', () => {
  it('should report 85% mutation score', async () => {
    const scoreResult = await readScoreResult();
    expect(scoreResult.killed).eq(12);
    expect(scoreResult.noCoverage).eq(1);
    expect(scoreResult.mutationScore).greaterThan(85).and.lessThan(86);
  });

  it('should write to a log file', async () => {
    const strykerLog = await fs.readFile('./stryker.log', 'utf8');
    expect(strykerLog).contains('INFO InputFileResolver Found 2 of 10 file(s) to be mutated');
    expect(strykerLog).matches(/Stryker Done in \d+/);
    // TODO, we now have an error because of a memory leak: https://github.com/jasmine/jasmine-npm/issues/134
    // expect(strykerLog).not.contains('ERROR');
  });
});
