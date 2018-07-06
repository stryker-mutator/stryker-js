import * as fs from 'mz/fs';
import { expect } from 'chai';
import * as path from 'path';
import { ScoreResult } from 'stryker-api/report';

describe('After running stryker on angular project', () => {
  it('should report 9% mutation score', async () => {
    const eventsDir = path.resolve(__dirname, '..', 'reports', 'mutation', 'events');
    const allReportFiles = await fs.readdir(eventsDir);
    const scoreResultReportFile = allReportFiles.find(file => !!file.match(/.*onScoreCalculated.*/));
    expect(scoreResultReportFile).ok;
    const scoreResultContent = await fs.readFile(path.resolve(eventsDir, scoreResultReportFile || ''), 'utf8');
    const scoreResult = JSON.parse(scoreResultContent) as ScoreResult;
    expect(scoreResult.killed).eq(1);
    expect(scoreResult.survived).eq(10);
    expect(scoreResult.runtimeErrors).eq(2);

    expect(scoreResult.mutationScore).greaterThan(9).and.lessThan(10);
  });
});