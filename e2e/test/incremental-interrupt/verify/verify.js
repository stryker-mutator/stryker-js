/**
 * E2E test: verifies that when a Stryker incremental run is interrupted
 * (e.g. SIGTERM from CTRL+C), the partial incremental report is saved to disk.
 *
 * This ensures that the next incremental run can pick up where the interrupted
 * run left off, rather than losing the progress made during the interrupted run.
 *
 * Strategy:
 * 1. Spawn `stryker run` (configured with --incremental via stryker.conf.json)
 * 2. A custom "signal" reporter writes __MUTANT_TESTED__ to stdout when the
 *    first mutant result is produced — guaranteeing partialResults has ≥1 entry
 * 3. On seeing the marker, send SIGTERM to simulate user interruption
 * 4. Assert the incremental report file was written with valid content
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
  afterEach(async () => {
    // Cleanup any incremental report files after the test to ensure a clean slate for subsequent runs.
    await fsPromises.rm(rootResolve('reports'), {
      force: true,
      recursive: true,
    });
  });

  it('should save partial incremental report when killed during mutation testing', async () => {
    const onGoingStrykerRun = execa('stryker', ['run']);
    let killed = false;

    // A custom "signal" reporter plugin (signal-reporter.js) writes
    // __MUTANT_TESTED__ to stdout when the first mutant result is produced.
    // This guarantees partialResults contains at least 1 entry when we kill.
    onGoingStrykerRun.stdout.on('data', (data) => {
      const output = data.toString();
      if (!killed && output.includes('__MUTANT_TESTED__')) {
        killed = true;
        onGoingStrykerRun.kill('SIGTERM');
      }
    });

    // Act: await the process. It will be killed by SIGTERM, causing a rejection.
    /** @type {import('execa').ExecaError | undefined} */
    let execaError;
    try {
      await onGoingStrykerRun;
    } catch (error) {
      // Expected: execa rejects when the child process is killed by a signal.
      execaError = error;
    }

    // Guard: verify the process was actually interrupted (not a normal completion).
    expect(
      execaError,
      'Stryker should have been killed, not completed normally',
    ).to.exist;
    expect(
      execaError.signal ?? execaError.exitCode,
      'Process should have been terminated by signal or non-zero exit',
    ).to.satisfy(
      /** @param {string | number | undefined} v */
      (v) => v === 'SIGTERM' || (typeof v === 'number' && v !== 0),
    );

    // Verify the log message confirming the partial report was saved.
    const output = execaError.stdout ?? '';
    expect(output).to.contain('Saved a partial incremental report');

    // Assert: the partial incremental report should have been written by the
    // async exit handler in MutationTestReportHelper before process.exit().
    const reportContent = await fsPromises.readFile(incrementalFile, 'utf-8');
    const report = JSON.parse(reportContent);

    // Verify it contains at least some mutant results (reused + freshly tested)
    const totalMutants = Object.values(report.files).reduce(
      (sum, file) => sum + file.mutants.length,
      0,
    );
    expect(totalMutants).to.be.greaterThan(0);
  });
});
