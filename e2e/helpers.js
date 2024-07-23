import { promises as fsPromises } from 'fs';
import path from 'path';
import { execSync } from 'child_process';

import { use, expect } from 'chai';
import { calculateMutationTestMetrics } from 'mutation-testing-metrics';
import chaiJestSnapshot from 'chai-jest-snapshot';

use(chaiJestSnapshot);

before(function () {
  chaiJestSnapshot.resetSnapshotRegistry();
});

beforeEach(function () {
  chaiJestSnapshot.configureUsingMochaContext(this);
});

/**
 * @typedef PipedStdioSyncExecException
 * @property {Uint8Array} stdout
 * @property {Uint8Array} stderr
 * @property {number} status
 */

/**
 * @typedef ExecStrykerResult
 * @property {number} exitCode
 * @property {string} stdout
 * @property {string} stderr
 */

/**
 * @param {string} cmd
 * @returns {ExecStrykerResult}
 */
export function execStryker(cmd) {
  /**
   * @type {ExecStrykerResult}
   */
  let result;
  try {
    const out = execSync(cmd, { stdio: 'pipe' });
    result = {
      exitCode: 0,
      stderr: '',
      stdout: out.toString(),
    };
  } catch (err) {
    /**
     * @type {PipedStdioSyncExecException}
     */
    const childError = err;
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

/**
 *
 * @param {string} eventResultDirectory
 * @returns {Promise<import('mutation-testing-metrics').MutationTestMetricsResult>}
 */
export async function readMutationTestResult(eventResultDirectory = path.resolve('reports', 'mutation', 'events')) {
  const allReportFiles = await fsPromises.readdir(eventResultDirectory);
  const mutationTestReportFile = allReportFiles.find((file) => !!/.*onMutationTestReportReady.*/.exec(file));
  expect(mutationTestReportFile).ok;
  const mutationTestReportContent = await fsPromises.readFile(path.resolve(eventResultDirectory, mutationTestReportFile || ''), 'utf8');
  /**
   * @type {import('mutation-testing-report-schema/api').MutationTestResult}
   */
  const report = JSON.parse(mutationTestReportContent);
  const metricsResult = calculateMutationTestMetrics(report);
  return metricsResult;
}

export async function readMutationTestingJsonResult(jsonReportFile = path.resolve('reports', 'mutation', 'mutation.json')) {
  const mutationTestReportContent = await fsPromises.readFile(jsonReportFile, 'utf8');
  /**
   * @type {import('mutation-testing-report-schema/api').MutationTestResult}
   */
  const report = JSON.parse(mutationTestReportContent);
  return report;
}

/**
 * @param {string} [jsonReportFile]
 * @returns {Promise<import('mutation-testing-metrics').MutationTestMetricsResult>}
 */
export async function readMutationTestingJsonResultAsMetricsResult(jsonReportFile = path.resolve('reports', 'mutation', 'mutation.json')) {
  return calculateMutationTestMetrics(await readMutationTestingJsonResult(jsonReportFile));
}

/**
 * @param {string} fileName
 * @returns {Promise<string>}
 */
export function readLogFile(fileName = path.resolve('stryker.log')) {
  return fsPromises.readFile(fileName, 'utf8');
}

export async function expectMetricsJsonToMatchSnapshot() {
  const actualMetricsResult = await readMutationTestingJsonResultAsMetricsResult();
  expect(actualMetricsResult.systemUnderTestMetrics.metrics).to.matchSnapshot();
}
