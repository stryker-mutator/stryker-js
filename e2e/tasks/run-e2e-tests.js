import fs from 'fs';
import path from 'path';
import execa from 'execa';
import semver from 'semver';
import os from 'os';
import { from, defer } from 'rxjs';
import { tap, mergeAll, map } from 'rxjs/operators';
import minimatch from 'minimatch';
import { fileURLToPath } from 'url';

const testRootDir = fileURLToPath(new URL('../test', import.meta.url));

// const filter = ['cucumber-old-version',
//   'exit-prematurely-dry-run-fails',
//   'exit-prematurely-no-tests-executed',
//   'command',
//   'esm',
//   'flow-test-project',
//   'ignore-project',
//   'grunt-stryker-test',
//   'jasmine-javascript',
//   'babel-transpiling',
//   'angular-project',
//   'in-place',
//   'jest-mutate-outside-roots',
//   'jest-old-version',
//   'jest-node',
//   'jasmine-ts-node',
//   'jest-custom-env',

// ];

function runE2eTests() {
  const pattern = process.argv[2] ?? '*';
  const testDirs = fs
    .readdirSync(testRootDir, { withFileTypes: true })
    .filter((dir) => dir.isDirectory())
    // .filter((dir) => !filter.includes(dir.name))
    .map((dir) => dir.name)

    .filter(minimatch.filter(pattern));

  console.log(`Running e2e test in ${testDirs.length ? testDirs.join(', ') : '<none>'}`);
  console.log(`(matched with ${pattern})`);
  // Create test$, an observable of test runs
  const test$ = from(testDirs).pipe(map((testDir) => defer(() => runTest(testDir))));

  let testsRan = 0;
  return test$.pipe(
    mergeAll(os.cpus().length), // use mergeAll to limit concurrent test runs
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
 * @returns {Promise<execa.ExecaReturnValue<string>>}
 */
function execNpm(command, testDir, stream) {
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
  return testProcess.catch((error) => {
    console.log(`X ${testDir}`);
    console.log(stdout);
    console.error(stderr);
    throw error;
  });
}

/**
 * @param {string} testDir 
 * @returns {boolean}
 */
function satisfiesNodeVersion(testDir) {
  const pkg = JSON.parse(fs.readFileSync(path.resolve(testRootDir, testDir, 'package.json'), 'utf-8'));
  const supportedNodeVersionRange = pkg.engines && pkg.engines.node;
  if (supportedNodeVersionRange && !semver.satisfies(process.version, supportedNodeVersionRange)) {
    console.log(`\u2610 ${testDir} skipped (node version ${process.version} did not satisfy ${supportedNodeVersionRange})`);
    return false;
  } else {
    return true;
  }
}

/**
 * @param {string} testDir 
 * @returns {Promise<string>}
 */
async function runTest(testDir) {
  if (satisfiesNodeVersion(testDir)) {
    await execNpm('test', testDir, false);
  }
  return testDir;
}
