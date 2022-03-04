import path from 'path';

import { createRequire } from 'module';

import { TestResult, TestStatus } from '@stryker-mutator/api/test-runner';
import {
  assertions,
  factory,
  testInjector,
} from '@stryker-mutator/test-helpers';

import { expect } from 'chai';

import * as pluginTokens from '../../src/plugin-tokens.js';
import { CucumberTestRunner } from '../../src/index.js';
import { CucumberRunnerWithStrykerOptions } from '../../src/cucumber-runner-with-stryker-options.js';
import { resolveTestResource } from '../helpers/resolve-test-resource.js';

describe('Running in an example project', () => {
  let options: CucumberRunnerWithStrykerOptions;
  let sut: CucumberTestRunner;

  beforeEach(() => {
    process.chdir(resolveTestResource('example'));
    options = testInjector.options as CucumberRunnerWithStrykerOptions;
    options.cucumber = {};
    sut = testInjector.injector
      .provideValue(pluginTokens.globalNamespace, '__stryker2__' as const)
      .injectClass(CucumberTestRunner);
  });

  it('should be to run in the example', async () => {
    // Act
    const actual = await sut.dryRun(factory.dryRunOptions());

    // Assert
    const fileName = path.join('features', 'simple_math.feature');
    const expectedTests: Array<Partial<TestResult>> = [
      {
        status: TestStatus.Success,
        id: `${fileName}:7`,
        fileName,
        name: 'Feature: Simple maths -- Scenario: easy maths',
        startPosition: { line: 6, column: 3 },
      },
      {
        status: TestStatus.Success,
        id: `${fileName}:19`,
        name: 'Feature: Simple maths -- Scenario Outline: much more complex stuff [Example L19]',
        fileName,
        startPosition: {
          line: 18,
          column: 7,
        },
      },
      {
        status: TestStatus.Success,
        id: `${fileName}:20`,
        name: 'Feature: Simple maths -- Scenario Outline: much more complex stuff [Example L20]',
        fileName,
        startPosition: {
          line: 19,
          column: 7,
        },
      },
      {
        status: TestStatus.Success,
        id: `${fileName}:22`,
        fileName,
        name: 'Feature: Simple maths -- Scenario: static math',
        startPosition: {
          column: 3,
          line: 21,
        },
      },
    ];
    assertions.expectTestResults(actual, expectedTests);
  });

  it('should log the exec command on debug', async () => {
    const require = createRequire(import.meta.url);
    testInjector.logger.isDebugEnabled.returns(true);
    await sut.dryRun(factory.dryRunOptions());
    expect(testInjector.logger.debug).calledWith(
      `${process.cwd()} "node" "cucumber-js" "--retry" "0" "--parallel" "0" "--format" "${require.resolve(
        '../../src/cjs/stryker-formatter'
      )}" "--fail-fast"`
    );
  });

  it("shouldn't log if debug isn't enabled", async () => {
    testInjector.logger.isDebugEnabled.returns(false);
    await sut.dryRun(factory.dryRunOptions());
    expect(testInjector.logger.debug).not.called;
  });
});
