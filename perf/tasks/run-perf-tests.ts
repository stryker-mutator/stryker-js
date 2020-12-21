import * as fs from 'fs';
import * as path from 'path';
import * as execa from 'execa';
import { Observable } from 'rxjs';
import { tap, throttleTime } from 'rxjs/operators';
import * as minimatch from 'minimatch';

const testRootDir = path.resolve(__dirname, '..', 'test');

runPerfTests()
  .then(() => console.log('Done'))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

async function runPerfTests() {
  const globPattern = process.env.PERF_TEST_GLOB_PATTERN || '*';
  const testDirs = fs.readdirSync(testRootDir).filter((testDir) => minimatch(testDir, globPattern));
  if (testDirs.length) {
    console.log(`Running performance tests on ${testDirs.join(', ')} (matched with glob pattern "${globPattern}")`);
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
  await runStryker(testDir)
    .pipe(
      throttleTime(60000),
      tap((logMessage) => console.timeLog(testDir, 'last log message: ', logMessage))
    )
    .toPromise();
  console.timeEnd(testDir);
}

function runStryker(testDir: string): Observable<string> {
  const strykerBin = require.resolve('../../packages/core/bin/stryker');
  const args = [
    'run',
    '--plugins',
    [
      require.resolve('../../packages/mocha-runner'),
      require.resolve('../../packages/karma-runner'),
      require.resolve('../../packages/jest-runner'),
      require.resolve('../../packages/jasmine-runner'),
      require.resolve('../../packages/mocha-runner'),
      require.resolve('../../packages/typescript-checker'),
    ].join(','),
  ];
  const currentTestDir = path.resolve(testRootDir, testDir);
  console.log(`(${testDir}) exec "${strykerBin} ${args.join(' ')}"`);

  return new Observable((observer) => {
    const testProcess = execa(strykerBin, args, { timeout: 0, cwd: currentTestDir, stdio: 'pipe' });
    let stderr = '';
    testProcess.stderr?.on('data', (chunk) => (stderr += chunk.toString()));
    testProcess.stdout?.on('data', (chunk) => observer.next(chunk.toString().trim()));
    testProcess.then(() => observer.complete()).catch((error) => observer.error(error));
  });
}
