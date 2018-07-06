import * as fs from 'mz/fs';
import { expect } from 'chai';
import * as path from 'path';
import { ScoreResult } from 'stryker-api/report';

describe('After running stryker with test runner jasmine, test framework jasmine', () => {
  it('should report 85% mutation score', async () => {
    const allReportFiles = await fs.readdir(path.resolve('reports', 'mutation', 'events'));
    const scoreResultReportFile = allReportFiles.find(file => !!file.match(/.*onScoreCalculated.*/));
    expect(scoreResultReportFile).ok;
    const scoreResultContent = await fs.readFile(path.resolve('reports', 'mutation', 'events', scoreResultReportFile || ''), 'utf8');
    const scoreResult = JSON.parse(scoreResultContent) as ScoreResult;
    expect(scoreResult.killed).eq(12);
    expect(scoreResult.noCoverage).eq(1);
    expect(scoreResult.mutationScore).greaterThan(85).and.lessThan(86);
  });

  it('should write to a log file', async () => {
    const strykerLog = await fs.readFile('./stryker.log', 'utf8');
    expect(strykerLog).contains('INFO InputFileResolver Found 2 of 10 file(s) to be mutated');
    expect(strykerLog).matches(/Stryker Done in \d+ seconds/);
    // expect(strykerLog).not.contains('ERROR'); TODO
  });
});