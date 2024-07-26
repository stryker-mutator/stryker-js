import fs from 'fs';
import path from 'path';
import { parseArgs } from 'util';
import os from 'os';
import { fileURLToPath, URL } from 'url';

import { execa } from 'execa';
import semver from 'semver';
import { from, defer } from 'rxjs';
import { tap, mergeAll, map } from 'rxjs/operators';
import { minimatch } from 'minimatch';

import { satisfiesPlatform } from './utils.js';

const testRootDir = fileURLToPath(new URL('../test', import.meta.url));
const progressFile = path.join(os.tmpdir(), 'stryker-mutator-progress.json');

/**
 * @typedef Package
 * @property {object} [engines]
 * @property {string} engines.node
 * @property {number} [retries]
 * @property {string[]} [os]
 */

function runE2eTests() {
  const { positionals, values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      continue: { type: 'boolean', alias: 'c', default: false },
      concurrency: { type: 'string', default: Math.max(os.cpus().length / 2, 2).toString() },
    },
    allowPositionals: true,
  });
  /** @type {string[]} */
  const done = values.continue && fs.existsSync(progressFile) ? JSON.parse(fs.readFileSync(progressFile, 'utf-8')) : [];
  const concurrency = parseInt(values.concurrency, 10);

  const pattern = positionals[0] ?? '*';
  const testDirs = fs
    .readdirSync(testRootDir, { withFileTypes: true })
    .filter((dir) => dir.isDirectory())
    .map((dir) => dir.name)
    .filter((dir) => !done.includes(dir))
    .filter(minimatch.filter(pattern));

  console.log(`Running e2e test in ${testDirs.length ? testDirs.join(', ') : '<none>'}`);
  console.log(`(matched with ${pattern})`);
  if (done.length) {
    console.log('⏩ Resuming from previous run');
    done.forEach((testDir) => console.log(`~ ${testDir} skipped`));
  }

  // Create test$, an observable of test runs
  const abortController = new AbortController();
  const test$ = from(testDirs).pipe(
    map((testDir) =>
      defer(() => {
        if (!abortController.signal.aborted) {
          return runTest(testDir, abortController.signal);
        }
        return testDir;
      }),
    ),
  );

  let testsRan = 0;
  return test$.pipe(
    mergeAll(concurrency),
    tap({
      next: (testDir) => {
        if (!abortController.signal.aborted) {
          done.push(testDir);
          console.log(`\u2714 ${testDir} tested (${++testsRan}/${testDirs.length})`);
        }
      },
      error: () => {
        abortController.abort();
      },
      finalize: () => fs.writeFileSync(progressFile, JSON.stringify(done)),
    }),
  );
}
runE2eTests().subscribe({
  complete: () => console.log('✅ Done'),
  error: (err) => {
    console.error(err.message);
    console.error(`(continue from here with \`${path.basename(process.argv[1])} --continue\`)`);
    process.exitCode = 1;
  },
});

/**
 *
 * @param {string} command
 * @param {string} testDir
 * @param {{signal: AbortSignal}} options
 */
async function execNpm(command, testDir, { signal }) {
  const currentTestDir = path.resolve(testRootDir, testDir);
  console.log(`Exec ${testDir} npm ${command}`);
  try {
    return await execa('npm', [command], { cancelSignal: signal, cwd: currentTestDir });
  } catch (error) {
    if (error.isCanceled) {
      return testDir;
    } else {
      console.log(`X ${testDir}`);
      throw error;
    }
  }
}

/**
 * @param {Package} pkg
 * @returns {boolean}
 */
function satisfiesNodeVersion(pkg) {
  /** @type {string|undefined} */
  const supportedNodeVersionRange = pkg.engines?.node;
  if (supportedNodeVersionRange && !semver.satisfies(process.version, supportedNodeVersionRange)) {
    console.log(`(node version ${process.version} did not satisfy ${supportedNodeVersionRange})`);
    return false;
  } else {
    return true;
  }
}

class TestFailedError extends Error {
  /**
   * @param {string} testDir
   * @param {unknown} cause
   */
  constructor(testDir, cause) {
    super(`Test "${testDir}" failed${cause instanceof Error ? `: ${cause.message}` : ''}`, { cause });
    this.testDir = testDir;
  }
}

/**
 * @param {string} testDir
 * @param {AbortSignal} signal
 * @returns {Promise<string>}
 */
async function runTest(testDir, signal, count = 0) {
  /** @type {Package} */
  const pkg = JSON.parse(fs.readFileSync(path.resolve(testRootDir, testDir, 'package.json'), 'utf-8'));
  if (!satisfiesNodeVersion(pkg) || !satisfiesPlatform(pkg)) {
    console.log(`\u2610 ${testDir} skipped`);
    return testDir;
  }
  const testProcess = execNpm('test', testDir, { signal });
  try {
    await testProcess;
  } catch (err) {
    const retries = pkg.retries ?? 0;
    if (retries > count) {
      console.log(`~ ${testDir} Retrying ${retries - count} more time(s)...`);
      return await runTest(testDir, signal, count + 1);
    }
    throw new TestFailedError(testDir, err);
  }

  return testDir;
}
