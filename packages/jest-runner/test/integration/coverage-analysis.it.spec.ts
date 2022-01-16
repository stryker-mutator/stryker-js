import { commonTokens } from '@stryker-mutator/api/plugin';
import { assertions, factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { JestOptions } from '../../src-generated/jest-runner-options';
import { JestRunnerOptionsWithStrykerOptions } from '../../src/jest-runner-options-with-stryker-options';
import { JestTestRunner, createJestTestRunnerFactory } from '../../src/jest-test-runner';
import { createJestOptions } from '../helpers/producers';
import { resolveTestResource } from '../helpers/resolve-test-resource';

const jestTestRunnerFactory = createJestTestRunnerFactory('__stryker2__');

interface TestCase {
  name: string;
  jestConfig?: Partial<JestOptions>;
  focus?: boolean;
}

describe('JestTestRunner coverage analysis integration', () => {
  function createSut(overrides?: Partial<JestOptions>) {
    const options: JestRunnerOptionsWithStrykerOptions = factory.strykerWithPluginOptions({
      jest: createJestOptions(overrides),
    });
    return testInjector.injector.provideValue(commonTokens.options, options).injectFunction(jestTestRunnerFactory);
  }

  const nodeTestCases: TestCase[] = [
    { name: 'jasmine2-node' },
    { name: 'jest-circus-node', jestConfig: { config: { testRunner: 'jest-circus/runner' } } },
  ];

  nodeTestCases.forEach((testCase) => {
    (testCase.focus ? describe.only : describe)(`${testCase.name} project`, () => {
      const resolveTestCase: typeof resolveTestResource = resolveTestResource.bind(undefined, 'jasmine2-node-instrumented');
      let sut: JestTestRunner;

      beforeEach(() => {
        process.chdir(resolveTestCase());
        sut = createSut(testCase.jestConfig);
      });

      describe('dryRun', () => {
        it('should not provide coverage analysis if coverageAnalysis is "off"', async () => {
          const result = await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'off' }));
          assertions.expectCompleted(result);
          expect(result.mutantCoverage).undefined;
        });

        it('should provide static coverage when coverageAnalysis is "all"', async () => {
          const result = await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'all' }));
          assertions.expectCompleted(result);
          expect(result.mutantCoverage).not.undefined;
          expect(result.mutantCoverage!.perTest).deep.eq({});
          expect(result.mutantCoverage!.static).deep.eq({
            '0': 2,
            '1': 2,
            '2': 1,
            '3': 1,
            '4': 1,
            '5': 1,
            '6': 1,
            '7': 1,
            '8': 1,
            '9': 1,
            '10': 1,
            '11': 1,
            '12': 1,
            '13': 1,
            '14': 1,
            '15': 1,
            '16': 1,
          });
        });

        it('should provide perTest coverage when coverageAnalysis is "perTest"', async () => {
          const result = await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'perTest' }));
          assertions.expectCompleted(result);
          expect(result.mutantCoverage).not.undefined;
          expect(result.mutantCoverage!.static).deep.eq({});
          expect(result.mutantCoverage!.perTest).deep.eq({
            'Add should be able negate a number': {
              4: 1,
              5: 1,
            },
            'Add should be able to subtract using a negative number': {
              '0': 1,
              '1': 1,
            },
            'Add should be able to add one to a number': {
              2: 1,
              3: 1,
            },
            'Add should be able to add two numbers': {
              0: 1,
              1: 1,
            },
            'Add should be able to recognize a negative number': {
              6: 1,
              7: 1,
              8: 1,
              9: 1,
              10: 1,
              11: 1,
              12: 1,
              13: 1,
            },
            'Circle should have a circumference of 2PI when the radius is 1': {
              14: 1,
              15: 1,
              16: 1,
            },
          });
        });
      });

      describe('mutantRun', () => {
        it('should be able to kill a mutant with filtered tests', async () => {
          const result = await sut.mutantRun(
            factory.mutantRunOptions({
              testFilter: ['Add should be able to recognize a negative number'],
              activeMutant: factory.mutantTestCoverage({ id: '6' }),
              sandboxFileName: resolveTestCase('src', 'Add.js'),
            })
          );
          assertions.expectKilled(result);
          expect(result.killedBy).eq('Add should be able to recognize a negative number');
          expect(result.nrOfTests).eq(1);
        });

        it('should be able to survive a mutant when the test killing the mutant is not filtered', async () => {
          const result = await sut.mutantRun(
            factory.mutantRunOptions({
              testFilter: ['Add should be able to add two numbers', 'Circle should have a circumference of 2PI when the radius is 1'],
              activeMutant: factory.mutantTestCoverage({ id: '6' }), // mutant inside the "isNegativeNumber" function
              sandboxFileName: resolveTestCase('src', 'Add.js'),
            })
          );
          assertions.expectSurvived(result);
          expect(result.nrOfTests).eq(1); // Circle should have a circumference of 2PI when the radius is 1 is outside of the sandboxFileName
        });
      });
    });
  });

  const jsdomTestCases: TestCase[] = [{ name: 'jasmine2' }, { name: 'jest-circus', jestConfig: { config: { testRunner: 'jest-circus/runner' } } }];

  jsdomTestCases.forEach((testCase) => {
    (testCase.focus ? describe.only : describe)(`${testCase.name}-jsdom project`, () => {
      const resolveTestCase: typeof resolveTestResource = resolveTestResource.bind(undefined, 'jasmine2-jsdom-instrumented');
      let sut: JestTestRunner;
      beforeEach(() => {
        process.chdir(resolveTestCase());
        sut = createSut(testCase.jestConfig);
      });

      describe('dryRun', () => {
        it('should not provide coverage analysis if coverageAnalysis is "off"', async () => {
          const result = await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'off' }));
          assertions.expectCompleted(result);
          expect(result.mutantCoverage).undefined;
        });

        it('should provide static coverage when coverageAnalysis is "all"', async () => {
          const result = await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'all' }));
          assertions.expectCompleted(result);
          expect(result.mutantCoverage).not.undefined;
          expect(result.mutantCoverage!.perTest).deep.eq({});
          expect(result.mutantCoverage!.static).deep.eq({
            0: 4,
            1: 4,
            2: 2,
            3: 4,
            4: 2,
            5: 2,
            6: 2,
            8: 2,
            11: 1,
            12: 2,
            13: 1,
            14: 1,
            15: 1,
            16: 1,
            17: 1,
            18: 1,
            19: 1,
            20: 1,
            21: 1,
            22: 1,
            23: 1,
            24: 1,
            25: 1,
            26: 1,
            30: 1,
          });
        });

        it('should provide perTest coverage when coverageAnalysis is "perTest"', async () => {
          const result = await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'perTest' }));
          assertions.expectCompleted(result);
          expect(result.mutantCoverage).not.undefined;
          expect(result.mutantCoverage!.static).deep.eq({ 22: 1, 30: 1 });
          expect(result.mutantCoverage!.perTest).deep.eq({
            'Add should be able to add two numbers': {
              0: 1,
              1: 1,
              2: 1,
              3: 1,
              4: 1,
              5: 1,
              6: 1,
            },
            'Add should be able to add one to a number': {
              0: 1,
              1: 1,
              2: 1,
              3: 1,
              4: 1,
              5: 1,
              6: 1,
            },
            'Add should be able negate a number': {
              0: 1,
              1: 1,
              3: 1,
              8: 1,
              11: 1,
              12: 1,
              13: 1,
              14: 1,
            },
            'Add should be able to recognize a negative number': {
              0: 1,
              1: 1,
              3: 1,
              8: 1,
              12: 1,
              15: 1,
              16: 1,
              17: 1,
              18: 1,
              19: 1,
              20: 1,
              21: 1,
            },
            'Circle should have a circumference of 2PI when the radius is 1': {
              23: 1,
              24: 1,
              25: 1,
              26: 1,
            },
          });
        });
      });

      describe('mutantRun', () => {
        it('should be able to kill a mutant with filtered tests', async () => {
          const result = await sut.mutantRun(
            factory.mutantRunOptions({
              testFilter: ['Add should be able to recognize a negative number'],
              activeMutant: factory.mutantTestCoverage({ id: '21' }),
              sandboxFileName: resolveTestCase('src', 'Add.js'),
            })
          );
          assertions.expectKilled(result);
          expect(result.killedBy).eq('Add should be able to recognize a negative number');
          expect(result.nrOfTests).eq(1);
        });

        it('should be able to survive a mutant when the test killing the mutant is not filtered', async () => {
          const result = await sut.mutantRun(
            factory.mutantRunOptions({
              testFilter: ['Add should be able to add two numbers', 'Circle should have a circumference of 2PI when the radius is 1'],
              activeMutant: factory.mutantTestCoverage({ id: '11' }), // mutant inside the "negate" function
              sandboxFileName: resolveTestCase('src', 'Add.js'),
            })
          );
          assertions.expectSurvived(result);
          expect(result.nrOfTests).eq(1); // Circle should have a circumference of 2PI when the radius is 1 is outside of the sandboxFileName
        });
      });
    });
  });
});
