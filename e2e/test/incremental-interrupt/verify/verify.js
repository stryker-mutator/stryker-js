/**
 * E2E test: verifies that when a Stryker incremental run is interrupted
 * (e.g. SIGTERM from CTRL+C), the partial incremental report is saved to disk.
 *
 * This ensures that the next incremental run can pick up where the interrupted
 * run left off, rather than losing the progress made during the interrupted run.
 *
 * Strategy:
 * 1. Spawn `stryker run` (configured with --incremental via stryker.conf.json)
 * 2. Wait for stdout to indicate mutation testing has started
 * 3. Send SIGTERM after a short delay to simulate user interruption
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
    await fsPromises.rm(rootResolve('reports'), {
      force: true,
      recursive: true,
    });
  });

  it('should save partial incremental report when killed during mutation testing', async () => {
    // Arrange: spawn Stryker with --incremental (configured in stryker.conf.json).
    // We use execa('stryker', ...) rather than execa('node', ['.../.bin/stryker', ...])
    // because the .bin/stryker file is a shell shim, not a JS file.
    const onGoingStrykerRun = execa('stryker', ['run']);
    let killed = false;

    // Listen for "Initial test run succeeded" in stdout, which indicates the
    // dry run completed and mutation testing is about to start.
    onGoingStrykerRun.stdout.on('data', (data) => {
      const output = data.toString();
      if (!killed && output.includes('Initial test run succeeded')) {
        killed = true;
        // Wait 1 second to let mutation testing start and produce results.
        // The tests have a 200ms delay each, ensuring the mutation testing
        // phase takes several seconds — enough time for this kill to land
        // mid-run.
        setTimeout(() => {
          onGoingStrykerRun.kill('SIGTERM');
        }, 1000);
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
    // If Stryker completed normally before the kill arrived, the test would be
    // a false positive — the incremental file would exist from normal flow.
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

    // Assert: the partial incremental report should have been written by the
    // async exit handler in MutationTestReportHelper before process.exit().
    const reportContent = await fsPromises.readFile(incrementalFile, 'utf-8');
    const report = JSON.parse(reportContent);

    // Verify it conforms to the mutation-testing-report-schema structure
    expect(report).to.have.property('schemaVersion', '1.0');
    expect(report).to.have.property('files');
    expect(report).to.have.property('thresholds');

    // Verify it contains at least some mutant results (reused + freshly tested)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const totalMutants = Object.values(report.files).reduce(
      (sum, file) => sum + file.mutants.length,
      0,
    );
    expect(totalMutants).to.be.greaterThan(0);
  });
});
