import { promises as fsPromises } from 'fs';

import { mutationTestReportSchema } from '@stryker-mutator/api/report';
import chai from 'chai';
import path from 'path';
import { calculateMutationTestMetrics, Metrics } from 'mutation-testing-metrics';
import { execSync, ExecException } from 'child_process';
import chaiJestSnapshot from 'chai-jest-snapshot';
const { expect } = chai;

chai.use(chaiJestSnapshot);

before(function () {
  chaiJestSnapshot.resetSnapshotRegistry();
});

beforeEach(function () {
  chaiJestSnapshot.configureUsingMochaContext(this);
});

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
  const metricsResult = calculateMutationTestMetrics(report);
  return metricsResult;
}

export async function readMutationTestingJsonResult(jsonReportFile = path.resolve('reports', 'mutation', 'mutation.json')) {
  const mutationTestReportContent = await fsPromises.readFile(jsonReportFile, 'utf8');
  const report = JSON.parse(mutationTestReportContent) as mutationTestReportSchema.MutationTestResult;
  const metricsResult = calculateMutationTestMetrics(report);
  return metricsResult;
}

export function readLogFile(fileName = path.resolve('stryker.log')): Promise<string> {
  return fsPromises.readFile(fileName, 'utf8');
}

export async function expectMetricsJsonToMatchSnapshot() {
  const actualMetricsResult = await readMutationTestingJsonResult();
  expect(actualMetricsResult.systemUnderTestMetrics.metrics).to.matchSnapshot();
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
