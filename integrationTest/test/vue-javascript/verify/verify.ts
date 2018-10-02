import * as fs from 'mz/fs';
import { expect } from 'chai';
import * as path from 'path';
import { ScoreResult } from 'stryker-api/report';

describe('After running stryker on VueJS project', () => {
  it('should report 25% mutation score', async () => {
    const eventsDir = path.resolve(__dirname, '..', 'reports', 'mutation', 'events');
    const allReportFiles = await fs.readdir(eventsDir);
    const scoreResultReportFile = allReportFiles.find(file => !!file.match(/.*onScoreCalculated.*/));
    expect(scoreResultReportFile).ok;
    const scoreResultContent = await fs.readFile(path.resolve(eventsDir, scoreResultReportFile || ''), 'utf8');
    const scoreResult = JSON.parse(scoreResultContent) as ScoreResult;
    expect(scoreResult.killed).eq(4);
    expect(scoreResult.survived).eq(12);

    expect(scoreResult.mutationScore).to.equal(25);
  });
});
