import { fsAsPromised } from '@stryker-mutator/util';
import { expect } from 'chai';
import * as path from 'path';
import { ScoreResult } from 'stryker-api/report';

export async function readScoreResult(eventResultDirectory = path.resolve('reports', 'mutation', 'events')) {
  const allReportFiles = await fsAsPromised.readdir(eventResultDirectory);
  const scoreResultReportFile = allReportFiles.find(file => !!file.match(/.*onScoreCalculated.*/));
  expect(scoreResultReportFile).ok;
  const scoreResultContent = await fsAsPromised.readFile(path.resolve(eventResultDirectory, scoreResultReportFile || ''), 'utf8');

  return JSON.parse(scoreResultContent) as ScoreResult;
}
