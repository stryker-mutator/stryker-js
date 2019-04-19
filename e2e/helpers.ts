import { mutationTestReportSchema } from '@stryker-mutator/api/report';
import { fsAsPromised } from '@stryker-mutator/util';
import { expect } from 'chai';
import * as path from 'path';

export async function readMutationTestResult(eventResultDirectory = path.resolve('reports', 'mutation', 'events')) {
  const allReportFiles = await fsAsPromised.readdir(eventResultDirectory);
  const mutationTestReportFile = allReportFiles.find(file => !!file.match(/.*onMutationTestReportReady.*/));
  expect(mutationTestReportFile).ok;
  const mutationTestReportContent = await fsAsPromised.readFile(path.resolve(eventResultDirectory, mutationTestReportFile || ''), 'utf8');
  return JSON.parse(mutationTestReportContent) as mutationTestReportSchema.MutationTestResult;
}

type WritableMutationTestResult = {
  -readonly [K in keyof MutationTestResult]: MutationTestResult[K];
};

export async function expectMutationTestResult(expectedMutationTestResult: Partial<MutationTestResult>) {
  const actualMutationTestResult = await readMutationTestResult();
  const actualSnippet: Partial<WritableMutationTestResult> = {};
  for (const key in expectedMutationTestResult) {
    actualSnippet[key as keyof MutationTestResult] = actualMutationTestResult[key as keyof MutationTestResult];
  }
  if (typeof actualSnippet.metrics.mutationScore === 'number') {
    actualSnippet.mutationScore = parseFloat(actualSnippet.mutationScore.toFixed(2));
  }
  expect(actualSnippet).deep.eq(expectedMutationTestResult);
}
