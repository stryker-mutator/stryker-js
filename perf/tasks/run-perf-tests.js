import fs from 'fs';
import { fileURLToPath, URL } from 'url';

import { execa } from 'execa';
import { lastValueFrom, Observable, tap, throttleTime } from 'rxjs';
import minimatch from 'minimatch';

const testRootDirUrl = new URL('../test', import.meta.url);

runPerfTests()
  .then(() => console.log('Done'))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

async function runPerfTests() {
  const globPattern = process.env.PERF_TEST_GLOB_PATTERN || '*';
  const testDirs = (await fs.promises.readdir(testRootDirUrl)).filter((testDir) => minimatch(testDir, globPattern));
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

/**
 * @param {string} testDir
 */
async function runTest(testDir) {
  console.time(testDir);
  await lastValueFrom(
    runStryker(testDir).pipe(
      throttleTime(60000),
      tap((logMessage) => console.timeLog(testDir, 'last log message: ', logMessage))
    )
  );
  console.timeEnd(testDir);
}

/**
 * @param {string} testDir
 * @returns {Observable<string>}
 */
function runStryker(testDir) {
  const strykerBin = require.resolve('../../packages/core/bin/stryker');
  const args = [
    'run',
    '--plugins',
    [
      require.resolve('../../packages/mocha-runner'),
      require.resolve('../../packages/karma-runner'),
      require.resolve('../../packages/jest-runner'),
      require.resolve('../../packages/jasmine-runner'),
      require.resolve('../../packages/typescript-checker'),
    ].join(','),
  ];
  const currentTestDirUrl = new URL(testDir, `${testRootDirUrl}/`);
  console.log(`(${testDir}) exec "${strykerBin} ${args.join(' ')}"`);

  return new Observable((observer) => {
    const testProcess = execa(strykerBin, args, { timeout: 0, cwd: fileURLToPath(currentTestDirUrl), stdio: 'pipe' });
    let stderr = '';
    testProcess.stderr?.on('data', (chunk) => (stderr += chunk.toString()));
    testProcess.stdout?.on('data', (chunk) => observer.next(chunk.toString().trim()));
    testProcess.then(() => observer.complete()).catch((error) => observer.error(error));
  });
}
