import { promises, statSync } from 'fs';
import * as path from 'path';
import * as execa from 'execa';
import * as semver from 'semver';
import { from, Observable, Observer, zip } from 'rxjs';
import { tap, toArray, flatMap } from 'rxjs/operators';

const testRootDir = path.resolve(__dirname, '..', 'test');

class TicketProvider {
  private observer: Observer<null>;
  public observable = new Observable<null>(observer => {
    this.observer = observer;
    for (let i = 0; i < this.concurrency; i++) {
      this.next();
    }
  });
  constructor(private concurrency: number) { }
  public next() {
    this.observer.next(null);
  }
  public complete() {
    this.observer.complete();
  }
}

async function runIntegrationTests() {
  const dirs = await promises.readdir(testRootDir)
    .then(dirs => dirs.filter(file => statSync(path.join(testRootDir, file)).isDirectory()));

  const ticket$ = new TicketProvider(4);
  let testsRan = 0;
  const test$ = zip(from(dirs), ticket$.observable).pipe(
    flatMap(([dir]) => runTest(dir)),
    tap(testDir => console.log(`\u2714 ${testDir} tested (${++testsRan}/${dirs.length})`)),
    tap(() => ticket$.next()),
    toArray()
  );
  return test$.toPromise();
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
