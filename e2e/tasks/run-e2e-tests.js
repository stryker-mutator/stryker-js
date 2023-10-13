import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath, URL } from 'url';

import { execa } from 'execa';
import semver from 'semver';
import { from, defer } from 'rxjs';
import { tap, mergeAll, map } from 'rxjs/operators';
import { minimatch } from 'minimatch';

import { satisfiesPlatform } from './utils.js';

const testRootDir = fileURLToPath(new URL('../test', import.meta.url));

/**
 * @typedef Package
 * @property {object} [engines]
 * @property {string} engines.node
 * @property {string[]} [os]
 */

function runE2eTests() {
  const pattern = process.argv[2] ?? '*';
  const testDirs = fs
    .readdirSync(testRootDir, { withFileTypes: true })
    .filter((dir) => dir.isDirectory())
    .map((dir) => dir.name)
    .filter(minimatch.filter(pattern));

  console.log(`Running e2e test in ${testDirs.length ? testDirs.join(', ') : '<none>'}`);
  console.log(`(matched with ${pattern})`);
  // Create test$, an observable of test runs
  const test$ = from(testDirs).pipe(map((testDir) => defer(() => runTest(testDir))));

  let testsRan = 0;
  const concurrency = Math.max(os.cpus().length / 2, 2);
  return test$.pipe(
    mergeAll(concurrency),
    tap((testDir) => console.log(`\u2714 ${testDir} tested (${++testsRan}/${testDirs.length})`))
  );
}

runE2eTests().subscribe({
  complete: () => console.log('✅ Done'),
  error: (err) => {
    console.error(err);
    process.exit(1);
  },
});

/**
 *
 * @param {string} command
 * @param {string} testDir
 * @param {boolean} stream
 * @returns {Promise<import('execa').ExecaReturnValue<string>>}
 */
async function execNpm(command, testDir, stream) {
  const currentTestDir = path.resolve(testRootDir, testDir);
  console.log(`Exec ${testDir} npm ${command}`);
  const testProcess = execa('npm', [command], { timeout: 500000, cwd: currentTestDir, stdio: 'pipe' });
  let stderr = '';
  let stdout = '';
  testProcess.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
    if (stream) {
      console.error(chunk.toString());
    }
  });
  testProcess.stdout.on('data', (chunk) => {
    stdout += chunk.toString();
    if (stream) {
      console.log(chunk.toString());
    }
  });
  try {
    return await testProcess;
  } catch (error) {
    console.log(`X ${testDir}`);
    console.log(stdout);
    console.error(stderr);
    throw error;
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

/**
 * @param {string} testDir
 * @returns {Promise<number>}
 */
async function retryCount(testDir) {
  const pkg = await fs.promises.readFile(path.resolve(testRootDir, testDir, 'package.json'), 'utf-8');
  return JSON.parse(pkg).retries ?? 0;
}

/**
 * @param {string} testDir
 * @returns {Promise<string>}
 */
async function runTest(testDir, count = 0) {
  /** @type {Package} */
  const pkg = JSON.parse(fs.readFileSync(path.resolve(testRootDir, testDir, 'package.json'), 'utf-8'));
  if (satisfiesNodeVersion(pkg) && satisfiesPlatform(pkg)) {
    try {
      await execNpm('test', testDir, false);
    } catch (err) {
      const retries = await retryCount(testDir);
      if (retries > count) {
        console.log(`~ ${testDir} Retrying ${retries - count} more time(s)...`);
        return runTest(testDir, count + 1);
      }
      throw err;
    }
  } else {
    console.log(`\u2610 ${testDir} skipped`);
  }
  return testDir;
}
