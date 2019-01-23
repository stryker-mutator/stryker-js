import * as path from 'path';
import { fsAsPromised } from '@stryker-mutator/util';
import { expect } from 'chai';
import { ScoreResult } from 'stryker-api/report';

export async function readScoreResult(eventResultDirectory = path.resolve('reports', 'mutation', 'events')) {
  const allReportFiles = await fsAsPromised.readdir(eventResultDirectory);
  const scoreResultReportFile = allReportFiles.find(file => !!file.match(/.*onScoreCalculated.*/));
  expect(scoreResultReportFile).ok;
  const scoreResultContent = await fsAsPromised.readFile(path.resolve(eventResultDirectory, scoreResultReportFile || ''), 'utf8');
  return JSON.parse(scoreResultContent) as ScoreResult;
}

type WritableScoreResult = {
  -readonly [K in keyof ScoreResult]: ScoreResult[K];
};

export async function expectScoreResult(expectedScoreResult: Partial<ScoreResult>) {
  const actualScoreResult = await readScoreResult();
  const actualSnippet: Partial<WritableScoreResult> = {};
  for (const key in expectedScoreResult) {
    actualSnippet[key as keyof ScoreResult] = actualScoreResult[key as keyof ScoreResult];
  }
  if (typeof actualSnippet.mutationScore === 'number') {
    actualSnippet.mutationScore = parseFloat(actualSnippet.mutationScore.toFixed(2));
  }

  expect(actualSnippet).deep.eq(expectedScoreResult);
}
