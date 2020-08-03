import fs = require('fs');
import * as path from 'path';
import execa from 'execa';
import * as semver from 'semver';
import * as os from 'os';
import { from, defer } from 'rxjs';
import { tap, mergeAll, map } from 'rxjs/operators';

const testRootDir = path.resolve(__dirname, '..', 'test');

const mutationSwitchingTempWhiteList = [
  'jasmine-ts-node',
  'jasmine-jasmine',
  'karma-mocha',
  'karma-jasmine',
  'webpack-zero-conf-karma',
  'vue-javascript',
  'karma-webpack-with-ts',
  'mocha-mocha',
  'mocha-ts-node',
  'babel-transpiling',
  'typescript-transpiling',
  'command',
  'vue-cli-typescript-mocha'
]

function runE2eTests() {
  const testDirs = fs.readdirSync(testRootDir).filter(dir => fs.statSync(path.join(testRootDir, dir)).isDirectory()).filter(dir => mutationSwitchingTempWhiteList.includes(dir));

  // Create test$, an observable of test runs
  const test$ = from(testDirs).pipe(map(testDir => defer(() => runTest(testDir))));

  let testsRan = 0;
  return test$.pipe(
    mergeAll(os.cpus().length && 2), // use mergeAll to limit concurrent test runs
    tap(testDir => console.log(`\u2714 ${testDir} tested (${++testsRan}/${testDirs.length})`)),
  );
}

runE2eTests()
  .subscribe({
    complete: () => console.log('✅ Done'),
    error: err => {
      console.error(err);
      process.exit(1);
    },
  });

function execNpm(command: string, testDir: string, stream: boolean) {
  const currentTestDir = path.resolve(testRootDir, testDir);
  console.log(`Exec ${testDir} npm ${command}`);
  const testProcess = execa('npm', [command], { timeout: 500000, cwd: currentTestDir, stdio: 'pipe' });
  let stderr = '';
  let stdout = '';
  testProcess.stderr.on('data', chunk => {
    stderr += chunk.toString();
    if (stream) {
      console.error(chunk.toString());
    }
  });
  testProcess.stdout.on('data', chunk => {
    stdout += chunk.toString()
    if (stream) {
      console.log(chunk.toString());
    }
  });
  return testProcess.catch(error => {
    console.log(`X ${testDir}`);
    console.log(stdout);
    console.error(stderr);
    throw error;
  });
}

function satisfiesNodeVersion(testDir: string): boolean {
  const pkg = require(path.resolve(testRootDir, testDir, 'package.json'));
  const supportedNodeVersionRange = pkg.engines && pkg.engines.node;
  if (supportedNodeVersionRange && !semver.satisfies(process.version, supportedNodeVersionRange)) {
    console.log(`\u2610 ${testDir} skipped (node version ${process.version} did not satisfy ${supportedNodeVersionRange})`);
    return false;
  } else {
    return true;
  }
}

async function runTest(testDir: string) {
  if (satisfiesNodeVersion(testDir)) {
    await execNpm('test', testDir, false);
  }
  return testDir;
}
