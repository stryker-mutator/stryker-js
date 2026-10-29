import { promises as fsPromises } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { Stryker } from '@stryker-mutator/core';
import { expect } from 'chai';
import { PlanKind } from '@stryker-mutator/api/core';

import { MutationRunPlanReporter } from './mutation-run-plan-reporter.js';

import '../../../helpers.js';

const incrementalFile = new URL(
  '../reports/stryker-incremental.json',
  import.meta.url,
);

describe('incremental', () => {
  /**
   * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
   */
  let strykerOptions;

  beforeEach(async () => {
    await fsPromises.rm(incrementalFile, { force: true });
    strykerOptions = {
      incremental: true,
      concurrency: 1,
      plugins: ['./verify/mutation-run-plan-reporter.js'],
      reporters: ['mutation-run-plan', 'html'],
      timeoutMS: 60_000,
    };
    await changeFiles('original'); // change the files back to there original state
  });

  afterEach(async () => {
    await changeFiles('original'); // change the files back to there original state
  });

  const reuseCountExpectation = Object.freeze({
    // This is the best result, we should strive to push each test runner to this
    withFullTestResults: 4,
    // We know which test files are changed and assume each test in that file changed
    withoutTestLocations: 2,
    // We know which test file the test originated from, but we can't differentiate between tests in the file (TAP runner)
    withoutTestDeviation: 2,
    // Don't know from which test files the tests originated
    withoutTestFiles: 7,
  });

  /**
   * @type {Array<[string, number, import('@stryker-mutator/api/core').PartialStrykerOptions?, boolean?]>}
   */
  const tests = [
    ['cucumber', reuseCountExpectation.withFullTestResults],
    [
      'jest',
      reuseCountExpectation.withFullTestResults,
      {
        testRunnerNodeArgs: ['--experimental-vm-modules'],
        tempDirName: 'stryker-tmp',
      },
    ],
    ['vitest', reuseCountExpectation.withFullTestResults],

    ['mocha', reuseCountExpectation.withoutTestLocations],

    [
      'tap',
      reuseCountExpectation.withoutTestDeviation,
      { tap: { testFiles: ['spec/*.tap.js'] } },
    ],

    [
      'karma',
      reuseCountExpectation.withoutTestFiles,
      { karma: { configFile: 'karma.conf.cjs' } },
    ],
    [
      'jasmine',
      reuseCountExpectation.withoutTestFiles,
      { jasmineConfigFile: 'jasmine.json' },
    ],
    [
      'command',
      reuseCountExpectation.withoutTestFiles,
      { commandRunner: { command: 'npm run test:mocha' } },
    ],
  ];
  tests.forEach(
    ([testRunner, expectedReuseCount, additionalOptions, focus]) => {
      (focus ? it.only : it)(
        `should reuse expected mutant results for ${testRunner}`,
        async () => {
          // Arrange;
          strykerOptions.testRunner = testRunner;
          if (testRunner !== 'command') {
            strykerOptions.plugins.push(
              import.meta.resolve(`@stryker-mutator/${testRunner}-runner`),
            );
          }
          const stryker = new Stryker({
            ...strykerOptions,
            ...additionalOptions,
          });
          await stryker.runMutationTest();
          await fsPromises.access(incrementalFile);
          await changeFiles('changed');

          // Act
          await stryker.runMutationTest();

          // Assert
          let actualReuseCount = 0;
          const normalizedTestPlans =
            MutationRunPlanReporter.instance.event.mutantPlans.map((plan) => {
              // Remove all flaky attributes
              const { id, fileName, statusReason, ...mutant } = plan.mutant;
              if (plan.plan === PlanKind.EarlyResult) {
                actualReuseCount++;
              }
              return {
                plan: plan.plan,
                mutant: {
                  ...mutant,
                  killedBy: mutant.killedBy?.map((name) =>
                    name.replace(/\\/g, '/'),
                  ),
                  coveredBy: mutant.coveredBy?.map((name) =>
                    name.replace(/\\/g, '/'),
                  ),
                },
                fileName: path
                  .relative(
                    fileURLToPath(new URL('../', import.meta.url)),
                    fileName,
                  )
                  .replace(/\\/g, '/'),
              };
            });
          expect(actualReuseCount).eq(expectedReuseCount);
          expect(normalizedTestPlans).matchSnapshot();
        },
      );
    },
  );

  describe('incrementalRerunStaticOnTestChange', () => {
    const addedTestFile = new URL('../spec/static.spec.js', import.meta.url);

    beforeEach(async () => {
      await fsPromises.writeFile(
        new URL('../src/concat.js', import.meta.url),
        `export function createGreeting() { return 'Hello'; }
export const defaultGreeting = createGreeting();
export const staticGreeting = 'Hello';
`,
      );
      await fsPromises.writeFile(
        new URL('../spec/concat.spec.js', import.meta.url),
        `import { createGreeting } from '../src/concat.js';
it('should create a greeting', () => { createGreeting(); });
`,
      );
      strykerOptions.testRunner = 'mocha';
      strykerOptions.plugins.push(
        import.meta.resolve('@stryker-mutator/mocha-runner'),
      );
      strykerOptions.mutate = ['src/concat.js'];
    });

    afterEach(async () => {
      await fsPromises.rm(addedTestFile, { force: true });
    });

    for (const incrementalRerunStaticOnTestChange of [false, true]) {
      it(`should ${incrementalRerunStaticOnTestChange ? 'rerun' : 'reuse'} static and hybrid mutants when a test is added`, async () => {
        const stryker = new Stryker({
          ...strykerOptions,
          incrementalRerunStaticOnTestChange,
        });
        const firstResults = await stryker.runMutationTest();
        const firstStringMutants = firstResults.filter(
          ({ mutatorName }) => mutatorName === 'StringLiteral',
        );
        expect(firstStringMutants.map(({ status }) => status)).deep.eq([
          'Survived',
          'Survived',
        ]);
        expect(firstStringMutants.every(({ static: isStatic }) => isStatic))
          .true;
        expect(
          firstStringMutants.map(({ coveredBy }) => coveredBy.length).sort(),
        ).deep.eq([0, 1]);
        await fsPromises.writeFile(
          addedTestFile,
          `import { defaultGreeting, staticGreeting } from '../src/concat.js';
it('should initialize greetings', () => {
  expect(defaultGreeting).toBe('Hello');
  expect(staticGreeting).toBe('Hello');
});
`,
        );

        const actualResults = await stryker.runMutationTest();

        const expectedStatus = incrementalRerunStaticOnTestChange
          ? 'Killed'
          : 'Survived';
        expect(
          actualResults
            .filter(({ mutatorName }) => mutatorName === 'StringLiteral')
            .map(({ status }) => status),
        ).deep.eq([expectedStatus, expectedStatus]);
      });
    }
  });

  /**
   * @param {'changed' | 'original'} blueprint
   * @param location
   */
  async function changeFiles(
    blueprint,
    location = new URL('../', import.meta.url),
  ) {
    const ext = `.${blueprint}`;
    const entries = await fsPromises.readdir(location, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name !== 'node_modules') {
        const entryLoc = new URL(`${entry.name}/`, location);
        await changeFiles(blueprint, entryLoc);
      }
      if (entry.isFile() && entry.name.endsWith(ext)) {
        const entryLoc = new URL(entry.name, location);
        const newUrl = new URL(
          entry.name.substring(0, entry.name.length - ext.length),
          location,
        );
        await fsPromises.copyFile(entryLoc, newUrl);
      }
    }
  }
});
