import { assertions, factory, testInjector } from '@stryker-mutator/test-helpers';
import { commonTokens } from '@stryker-mutator/api/plugin';
import { expect } from 'chai';

import { JestTestRunner, createJestTestRunnerFactory } from '../../src/jest-test-runner.js';
import { JestOptions } from '../../src-generated/jest-runner-options.js';
import { JestRunnerOptionsWithStrykerOptions } from '../../src/jest-runner-options-with-stryker-options.js';
import { createJestOptions } from '../helpers/producers.js';
import { resolveTestResource } from '../helpers/resolve-test-resource.js';

const jestTestRunnerFactory = createJestTestRunnerFactory('__stryker2__');

interface TestCase {
  name: string;
  jestConfig?: Partial<JestOptions>;
  focus?: boolean;
}

describe('Infinite Loop', () => {
  function createSut(overrides?: Partial<JestOptions>) {
    const options: JestRunnerOptionsWithStrykerOptions = factory.strykerWithPluginOptions({
      jest: createJestOptions(overrides),
    });
    return testInjector.injector.provideValue(commonTokens.options, options).injectFunction(jestTestRunnerFactory);
  }

  const nodeTestCases: TestCase[] = [{ name: 'infinite-loop', jestConfig: { config: { testRunner: 'jest-circus/runner' } } }];

  nodeTestCases.forEach((testCase) => {
    (testCase.focus ? describe.only : describe)(`${testCase.name} project`, () => {
      const resolveTestCase: typeof resolveTestResource = resolveTestResource.bind(undefined, 'infinite-loop-instrumented');
      let sut: JestTestRunner;

      beforeEach(() => {
        process.chdir(resolveTestCase());
        sut = createSut(testCase.jestConfig);
      });

      it('should be able to recover using a hit counter with coverageAnalysis in mutantOption', async () => {
        const mutantRunOptions = factory.mutantRunOptions({
          sandboxFileName: resolveTestCase('infinite-loop.js'),
          activeMutant: factory.mutant({ id: '24' }),
          testFilter: ['should be able to break out of an infinite loop with a hit counter'],
          hitLimit: 10,
        });
        // Act
        const result = await sut.mutantRun(mutantRunOptions);
        console.log(result);
        // Assert
        assertions.expectTimeout(result);
        expect(result.reason).contains('Hit limit reached');
      });

      it('should reset hit counter state correctly between runs', async () => {
        const firstResult = await sut.mutantRun(
          factory.mutantRunOptions({
            sandboxFileName: resolveTestCase('infinite-loop.js'),
            activeMutant: factory.mutant({ id: '24' }),
            testFilter: ['should be able to break out of an infinite loop with a hit counter'],
            hitLimit: 10,
          })
        );
        const secondResult = await sut.mutantRun(
          factory.mutantRunOptions({
            sandboxFileName: resolveTestCase('infinite-loop.js'),
            activeMutant: factory.mutant({ id: '27' }),
            testFilter: ['should be able to break out of an infinite loop with a hit counter'],
            hitLimit: 10,
          })
        );
        assertions.expectTimeout(firstResult);
        assertions.expectKilled(secondResult);
      });
    });
  });
});
