import { commonTokens } from '@stryker-mutator/api/plugin';
import { SuccessTestResult } from '@stryker-mutator/api/test-runner';
import { assertions, factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { JestRunnerOptionsWithStrykerOptions } from '../../src/jest-runner-options-with-stryker-options';
import { JestTestRunner, jestTestRunnerFactory } from '../../src/jest-test-runner';
import { createJestOptions } from '../helpers/producers';
import { resolveTestResource } from '../helpers/resolve-test-resource';

describe('JestTestRunner with "create-react-app" project type', () => {
  let sut: JestTestRunner;

  beforeEach(() => {
    process.chdir(resolveTestResource('my-react-app'));
    const options: JestRunnerOptionsWithStrykerOptions = factory.strykerWithPluginOptions({
      jest: createJestOptions({
        projectType: 'create-react-app',
      }),
    });
    sut = testInjector.injector.provideValue(commonTokens.options, options).injectFunction(jestTestRunnerFactory);
  });

  it('should be able to run the tests', async () => {
    const result = await sut.dryRun({ coverageAnalysis: 'off' });

    const expectedTest: Omit<SuccessTestResult, 'timeSpentMs'> = {
      id: 'renders learn react link',
      name: 'renders learn react link',
      status: 0,
    };

    assertions.expectCompleted(result);
    expect(result.tests).lengthOf(1);
    expect(result.tests[0]).deep.contains(expectedTest);
  });
});
