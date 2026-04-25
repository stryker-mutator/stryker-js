/**
 * E2E test: verifies that when a Stryker incremental run is interrupted
 * (e.g. CTRL+C), the partial incremental report is saved to disk.
 *
 * This ensures that the next incremental run can pick up where the interrupted
 * run left off, rather than losing the progress made during the interrupted run.
 *
 * Strategy:
 * 1. Spawn `stryker run` (configured with --incremental via stryker.conf.json)
 * 2. A custom "signal" reporter emits SIGINT on the process EventEmitter after
 *    the first mutant result is produced — guaranteeing partialResults has ≥1 entry.
 *    process.emit() calls Node.js listeners directly (cross-platform; no OS signal).
 * 3. UnexpectedExitHandler catches it, runs async exit handlers (saves partial report),
 *    then calls process.exit(130).
 * 4. Assert the incremental report file was written with valid content.
 */
import { promises as fsPromises } from 'fs';
import path from 'path';
import { fileURLToPath, URL } from 'url';

import { expect } from 'chai';
import { execa } from 'execa';
import { it } from 'mocha';

const rootResolve = path.resolve.bind(
  path,
  fileURLToPath(new URL('..', import.meta.url)),
);

const incrementalFile = rootResolve('reports', 'stryker-incremental.json');

describe('incremental interrupt', () => {
  beforeEach(async () => {
    // Cleanup any incremental report files after the test to ensure a clean slate for subsequent runs.
    await fsPromises.rm(rootResolve('reports'), {
      force: true,
      recursive: true,
    });
  });

  it('should save partial incremental report when killed during mutation testing', async () => {
    // The signal reporter emits SIGINT on the process EventEmitter after the first mutant.
    // UnexpectedExitHandler catches it, runs async exit handlers, then calls process.exit(130).
    const onGoingStrykerRun = execa('stryker', ['run']);

    // Act: await the process. The signal reporter will trigger process.exit(130),
    // causing execa to reject with a non-zero exit code.
    /** @type {import('execa').ExecaError | undefined} */
    let execaError;
    try {
      await onGoingStrykerRun;
    } catch (error) {
      // Expected: execa rejects when the child process exits with a non-zero code.
      execaError = error;
    }

    // Guard: verify the process was actually interrupted (not a normal completion).
    expect(
      execaError,
      'Stryker should have been interrupted, not completed normally',
    ).to.exist;
    // SIGINT = signal number 2; UnexpectedExitHandler calls process.exit(128 + 2) = 130.
    expect(
      execaError.exitCode,
      'Process should have exited with code 130 (128 + SIGINT signal number 2)',
    ).to.equal(130);

    // Verify the log message confirming the partial report was saved.
    const output = execaError.stdout ?? '';
    expect(output).to.contain('Saved a partial incremental report');

    // Assert: the partial incremental report should have been written by the
    // async exit handler in MutationTestReportHelper before process.exit().
    const reportContent = await fsPromises.readFile(incrementalFile, 'utf-8');
    const report = JSON.parse(reportContent);

    // Verify it contains at least some mutant results.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const totalMutants = Object.values(report.files).reduce(
      (sum, file) => sum + file.mutants.length,
      0,
    );
    expect(totalMutants).to.be.greaterThan(0);
  });
});
