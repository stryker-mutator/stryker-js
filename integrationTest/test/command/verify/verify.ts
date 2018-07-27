import * as fs from 'mz/fs';
import { expect } from 'chai';
import * as path from 'path';
import { readScoreResult } from '../../../helpers';

describe('After running stryker with the command test runner', () => {
  it('should report 69% mutation score', async () => {
    const scoreResult = await readScoreResult(path.resolve('reports', 'mutation', 'events'));
    expect(scoreResult.killed).eq(16);
    expect(scoreResult.noCoverage).eq(0);
    expect(scoreResult.mutationScore).greaterThan(69).and.lessThan(70);
  });

  it('should write to a log file', async () => {
    const strykerLog = await fs.readFile('./stryker.log', 'utf8');
    expect(strykerLog).contains('INFO InitialTestExecutor Initial test run succeeded. Ran 1 test');
    expect(strykerLog).matches(/Stryker Done in \d+ seconds/);
    expect(strykerLog).not.contains('ERROR'); 
  });
});