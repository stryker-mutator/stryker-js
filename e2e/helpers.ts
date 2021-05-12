import { promises as fsPromises } from 'fs';

import { mutationTestReportSchema } from '@stryker-mutator/api/report';
import { expect } from 'chai';
import path from 'path';
import { calculateMetrics, MetricsResult, Metrics } from 'mutation-testing-metrics';
import { execSync, ExecException } from 'child_process';

interface PipedStdioSyncExecException extends ExecException {
  stdout: Uint8Array;
  stderr: Uint8Array;
  status: number;
}

export interface ExecStrykerResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export function execStryker(cmd: string): ExecStrykerResult {
  let result: ExecStrykerResult;
  try {
    const out = execSync(cmd, { stdio: 'pipe' });
    result = {
      exitCode: 0,
      stderr: '',
      stdout: out.toString(),
    };
  } catch (err) {
    const childError = err as PipedStdioSyncExecException;
    result = {
      exitCode: childError.status,
      stderr: childError.stderr.toString(),
      stdout: childError.stdout.toString(),
    };
  }
  if (result.stdout) {
    console.log(result.stdout);
  }
  if (result.stderr) {
    console.error(result.stderr);
  }
  return result;
}

export async function readMutationTestResult(eventResultDirectory = path.resolve('reports', 'mutation', 'events')) {
  const allReportFiles = await fsPromises.readdir(eventResultDirectory);
  const mutationTestReportFile = allReportFiles.find((file) => !!file.match(/.*onMutationTestReportReady.*/));
  expect(mutationTestReportFile).ok;
  const mutationTestReportContent = await fsPromises.readFile(path.resolve(eventResultDirectory, mutationTestReportFile || ''), 'utf8');
  const report = JSON.parse(mutationTestReportContent) as mutationTestReportSchema.MutationTestResult;
  const metricsResult = calculateMetrics(report.files);
  return metricsResult;
}

type WritableMetricsResult = {
  -readonly [K in keyof MetricsResult]: MetricsResult[K];
};

export function readLogFile(fileName = path.resolve('stryker.log')): Promise<string> {
  return fsPromises.readFile(fileName, 'utf8');
}

export async function expectMetricsResult(expectedMetricsResult: Partial<MetricsResult>) {
  const actualMetricsResult = await readMutationTestResult();
  const actualSnippet: Partial<WritableMetricsResult> = {};
  for (const key in expectedMetricsResult) {
    actualSnippet[key as keyof MetricsResult] = actualMetricsResult[key as keyof MetricsResult] as any;
  }
  if (actualSnippet.metrics) {
    if (typeof actualSnippet.metrics.mutationScore === 'number') {
      actualSnippet.metrics.mutationScore = parseFloat(actualSnippet.metrics.mutationScore.toFixed(2));
    }
    if (typeof actualSnippet.metrics.mutationScoreBasedOnCoveredCode === 'number') {
      actualSnippet.metrics.mutationScoreBasedOnCoveredCode = parseFloat(actualSnippet.metrics.mutationScoreBasedOnCoveredCode.toFixed(2));
    }
  }
  expect(actualSnippet).deep.eq(expectedMetricsResult);
}

export async function expectMetrics(expectedMetrics: Partial<Metrics>) {
  const actualMetricsResult = await readMutationTestResult();
  const actualMetrics: Partial<Metrics> = {};
  Object.entries(expectedMetrics).forEach(([key]) => {
    if (key === 'mutationScore' || key === 'mutationScoreBasedOnCoveredCode') {
      actualMetrics[key] = parseFloat(actualMetricsResult.metrics[key].toFixed(2));
    } else {
      actualMetrics[key as keyof Metrics] = actualMetricsResult.metrics[key as keyof Metrics];
    }
  });
  expect(actualMetrics).deep.eq(expectedMetrics);
}

export function produceMetrics(metrics: Partial<Metrics>): Metrics {
  return {
    compileErrors: 0,
    killed: 0,
    mutationScore: 0,
    mutationScoreBasedOnCoveredCode: 0,
    noCoverage: 0,
    runtimeErrors: 0,
    survived: 0,
    timeout: 0,
    ignored: 0,
    totalCovered: 0,
    totalDetected: 0,
    totalInvalid: 0,
    totalMutants: 0,
    totalUndetected: 0,
    totalValid: 0,
    ...metrics,
  };
}
