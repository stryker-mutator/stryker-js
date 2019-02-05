import * as fs from 'mz/fs';
import * as path from 'path';
import * as execa from 'execa';
import { interval, Observable, from, race } from 'rxjs';
import { tap, last, map, count, scan } from 'rxjs/operators';

const testRootDir = path.resolve(__dirname, '..', 'test');
const ONE_MINUTE = 60000;

runPerfTests()
  .then(() => console.log('Done'))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

async function runPerfTests() {
  const testDirs = fs.readdirSync(testRootDir);

  for (const testDir of testDirs) {
    await runTest(testDir);
  }
}

async function runTest(testDir: string) {
  console.time(testDir);
  await race(from(execNpm('test', testDir)), ticker(testDir)).toPromise();
  console.timeEnd(testDir);
}

function ticker(testDir: string) {
  return interval(ONE_MINUTE).pipe(
    scan((_, curr) => curr + 1, 0),
    tap(minutes => console.log(`Running ${testDir} for ${minutes} minute${minutes > 1 ? 's' : ''}.`)),
    last(),
    map(() => undefined)
  );
}

function execNpm(command: string, testDir: string): Observable<execa.ExecaReturns> {
  const currentTestDir = path.resolve(testRootDir, testDir);
  console.log(`Exec ${testDir} npm ${command}`);
  const testProcess = execa('npm', [command], { timeout: 500000, cwd: currentTestDir, stdio: 'pipe' });
  let stderr = '';
  let stdout = '';
  testProcess.stderr.on('data', chunk => stderr += chunk.toString());
  testProcess.stdout.on('data', chunk => stdout += chunk.toString());

  return from(testProcess.catch(error => {
    console.log(`X ${testDir}`);
    console.log(stdout);
    console.error(stderr);
    throw error;
  }));
}
