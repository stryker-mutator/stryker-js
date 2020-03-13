import * as fs from 'fs';
import * as path from 'path';
import * as execa from 'execa';
import { Observable } from 'rxjs';
import { tap, throttleTime } from 'rxjs/operators';

const testRootDir = path.resolve(__dirname, '..', 'test');

runPerfTests()
  .then(() => console.log('Done'))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

async function runPerfTests() {
  const testDirs = fs.readdirSync(testRootDir);
  console.time('all tests');
  for (const testDir of testDirs) {
    await runTest(testDir);
  }
  console.timeEnd('all tests');
}

async function runTest(testDir: string) {
  console.time(testDir);
  await execNpm(['run', 'stryker'], testDir).pipe(
    throttleTime(60000),
    tap(logMessage => console.timeLog(testDir, 'last log message: ', logMessage))
  ).toPromise();
  console.timeEnd(testDir);
}

function execNpm(args: string[], testDir: string): Observable<string> {
  const currentTestDir = path.resolve(testRootDir, testDir);
  console.log(`Exec ${testDir} npm ${args.join(' ')}`);

  return new Observable(observer => {
    const testProcess = execa('npm', args, { timeout: 0, cwd: currentTestDir, stdio: 'pipe' });
    let stderr = '';
    testProcess.stderr?.on('data', chunk => stderr += chunk.toString());
    testProcess.stdout?.on('data', chunk => observer.next(chunk.toString().trim()));
    testProcess
      .then(() => observer.complete())
      .catch(error => observer.error(error));
  });
}
