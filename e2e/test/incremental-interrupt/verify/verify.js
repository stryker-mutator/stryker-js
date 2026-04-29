/**
 * E2E tests for incremental interrupt behavior:
 *
 * 1. Verifies that when a Stryker incremental run is interrupted
 *    (e.g. CTRL+C), the partial incremental report is saved to disk.
 *
 * 2. Verifies that running Stryker in a loop with interrupts eventually
 *    tests all mutants — each run resumes from the partial incremental report.
 *
 * Strategy:
 * - A custom "signal" reporter emits SIGINT on the process EventEmitter after
 *   a configurable number of new (non-reused) mutant results. It uses
 *   `onMutationTestingPlanReady` to skip early-result (reused) mutants.
 * - The `STRYKER_SIGNAL_AFTER` env var controls how many new mutants to allow
 *   before interrupting (default: 1).
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

/**
 * Count the total number of mutants across all files in an incremental report.
 * @param {string} filePath
 * @returns {Promise<number>}
 */
async function countMutantsInReport(filePath) {
  const content = await fsPromises.readFile(filePath, 'utf-8');
  const report = JSON.parse(content);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return Object.values(report.files).reduce(
    (sum, file) => sum + file.mutants.length,
    0,
  );
}

describe('incremental interrupt', () => {
  beforeEach(async () => {
    // Cleanup any incremental report files to ensure a clean slate.
    await fsPromises.rm(rootResolve('reports'), {
      force: true,
      recursive: true,
    });
  });

  it('should save partial incremental report when killed during mutation testing', async () => {
    // The signal reporter emits SIGINT after the first new mutant (default STRYKER_SIGNAL_AFTER=1).
    // UnexpectedExitHandler catches it, runs async exit handlers, then calls process.exit(130).

    /** @type {import('execa').ExecaError | undefined} */
    let execaError;
    try {
      await execa('stryker', ['run']);
    } catch (error) {
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

    // Assert: the partial incremental report should have been written.
    const totalMutants = await countMutantsInReport(incrementalFile);
    expect(totalMutants).to.be.greaterThan(0);
  });

  it('should eventually test all mutants when run in a loop with interrupts', async () => {
    const MAX_ITERATIONS = 5; // Guard to prevent infinite loops in case of failure.
    let previousMutantCount = 0;
    let expectedTotalMutants = 9;
    let iteration = 0;

    while (iteration < MAX_ITERATIONS) {
      iteration++;

      /** @type {import('execa').ExecaError | undefined} */
      let execaError;
      let result;
      try {
        result = await execa('stryker', ['run'], {
          env: { STRYKER_SIGNAL_AFTER: '3' },
        });
      } catch (error) {
        execaError = error;
      }

      const stdout = execaError
        ? (execaError.stdout ?? '')
        : (result.stdout ?? '');

      if (!execaError) {
        // Stryker completed normally (exit 0) — all mutants tested.
        expect(result.exitCode).to.equal(0);

        // Must have had at least 2 interrupted runs before completing.
        expect(
          iteration,
          'Should have taken multiple iterations (at least 2 interrupted + 1 completion)',
        ).to.be.greaterThanOrEqual(3);

        // On runs after the first, Stryker should reuse results from the partial report.
        expect(
          stdout,
          'Final run should reuse mutant results from the partial incremental report',
        ).to.contain('mutant result(s) are reused');

        // Verify the final incremental report contains ALL mutants.
        const finalMutantCount = await countMutantsInReport(incrementalFile);
        expect(
          finalMutantCount,
          `Final report should contain all ${expectedTotalMutants} mutants`,
        ).to.equal(expectedTotalMutants);

        // Success: all mutants were eventually tested.
        return;
      }

      // Process was interrupted.
      expect(execaError.exitCode).to.equal(130);

      // After the first iteration, verify that incremental reuse is happening.
      if (iteration > 1) {
        expect(
          stdout,
          `Iteration ${iteration}: should reuse mutant results from previous partial report`,
        ).to.contain('mutant result(s) are reused');
      }

      // Verify the incremental report exists and has more mutants than before.
      const currentMutantCount = await countMutantsInReport(incrementalFile);
      expect(
        currentMutantCount,
        `Iteration ${iteration}: should have more mutants than previous run (${previousMutantCount})`,
      ).to.be.greaterThan(previousMutantCount);

      previousMutantCount = currentMutantCount;
    }

    // If we reach here, we exceeded MAX_ITERATIONS without completing.
    expect.fail(
      `Stryker did not complete after ${MAX_ITERATIONS} iterations. ` +
        `Last report had ${previousMutantCount} mutants.`,
    );
  });
});
