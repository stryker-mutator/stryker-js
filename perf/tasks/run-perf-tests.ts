import * as fs from 'fs';
import * as path from 'path';
import * as execa from 'execa';
import { Observable } from 'rxjs';
import { tap, throttleTime } from 'rxjs/operators';
import * as minimatch from 'minimatch';

const testRootDir = path.resolve(__dirname, '..', 'test');

runPerfTests()
  .then(() => console.log('Done'))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

async function runPerfTests() {
  const globPattern = process.env.PERF_TEST_GLOB_PATTERN || '*';
  const testDirs = fs.readdirSync(testRootDir).filter(testDir => minimatch(testDir, globPattern));
  if (testDirs.length) {
    console.log(`Running performance tests on ${testDirs.join(', ')}`)
  } else {
    console.warn(`No test files match glob expression ${globPattern}`);
  }

  console.time('all tests');
  for (const testDir of testDirs) {
    await runTest(testDir);
  }
  console.timeEnd('all tests');
}

async function runTest(testDir: string) {
  console.time(testDir);
  await npx(['stryker', 'run'], testDir).pipe(
    throttleTime(60000),
    tap(logMessage => console.timeLog(testDir, 'last log message: ', logMessage))
  ).toPromise();
  console.timeEnd(testDir);
}

function npx(args: string[], testDir: string): Observable<string> {
  const currentTestDir = path.resolve(testRootDir, testDir);
  console.log(`Exec ${testDir} npx ${args.join(' ')}`);

  return new Observable(observer => {
    const testProcess = execa('npx', args, { timeout: 0, cwd: currentTestDir, stdio: 'pipe' });
    let stderr = '';
    testProcess.stderr?.on('data', chunk => stderr += chunk.toString());
    testProcess.stdout?.on('data', chunk => observer.next(chunk.toString().trim()));
    testProcess
      .then(() => observer.complete())
      .catch(error => observer.error(error));
  });
}
