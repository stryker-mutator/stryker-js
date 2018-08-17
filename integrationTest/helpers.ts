import * as path from 'path';
import * as fs from 'mz/fs';
import { expect } from 'chai';
import { ScoreResult } from 'stryker-api/report';

export async function readScoreResult(eventResultDirectory = path.resolve('reports', 'mutation', 'events')) {
    const allReportFiles = await fs.readdir(eventResultDirectory);
    const scoreResultReportFile = allReportFiles.find(file => !!file.match(/.*onScoreCalculated.*/));
    expect(scoreResultReportFile).ok;
    const scoreResultContent = await fs.readFile(path.resolve(eventResultDirectory, scoreResultReportFile || ''), 'utf8');
    return JSON.parse(scoreResultContent) as ScoreResult;
}