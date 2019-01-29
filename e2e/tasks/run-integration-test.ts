import * as fs from 'mz/fs';
import * as path from 'path';
import * as execa from 'execa';
import * as semver from 'semver';
import * as os from 'os';
import { from, defer } from 'rxjs';
import { tap, toArray, mergeAll } from 'rxjs/operators';

const testRootDir = path.resolve(__dirname, '..', 'test');

async function runIntegrationTests() {
  const testDirs = await fs.readdir(testRootDir)
    .then(dirs => dirs.filter(file => fs.statSync(path.join(testRootDir, file)).isDirectory()));
  const test$ = from(testDirs.map(dir => defer(() => runTest(dir))));

  let testsRan = 0;
  const runTestsTask = test$.pipe(
    mergeAll(os.cpus().length),
    tap(testDir => console.log(`\u2714 ${testDir} tested (${++testsRan}/${testDirs.length})`)),
    toArray()
  ).toPromise();
  await runTestsTask;
}

runIntegrationTests()
  .then(() => console.log('Done'))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

function execNpm(command: string, testDir: string) {
  const currentTestDir = path.resolve(testRootDir, testDir);
  console.log(`Exec ${testDir} npm ${command}`);
  const testProcess = execa('npm', [command], { timeout: 500000, cwd: currentTestDir, stdio: 'pipe' });
  let stderr = '';
  let stdout = '';
  testProcess.stderr.on('data', chunk => stderr += chunk.toString());
  testProcess.stdout.on('data', chunk => stdout += chunk.toString());
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
    await execNpm('test', testDir);
  }
  return testDir;
}
