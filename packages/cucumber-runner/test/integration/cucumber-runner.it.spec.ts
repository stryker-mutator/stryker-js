import { TestResult, TestStatus } from '@stryker-mutator/api/test-runner';
import {
  assertions,
  factory,
  testInjector,
} from '@stryker-mutator/test-helpers';

import * as pluginTokens from '../../src/plugin-tokens';
import { CucumberTestRunner } from '../../src';
import { CucumberRunnerWithStrykerOptions } from '../../src/cucumber-runner-with-stryker-options';
import { resolveTestResource } from '../helpers/resolve-test-resource';

describe('Running in an example project', () => {
  let options: CucumberRunnerWithStrykerOptions;

  beforeEach(() => {
    options = testInjector.options as CucumberRunnerWithStrykerOptions;
    options.cucumber = {};
  });

  function createSut(): CucumberTestRunner {
    return testInjector.injector
      .provideValue(pluginTokens.globalNamespace, '__stryker2__' as const)
      .injectClass(CucumberTestRunner);
  }

  it('should be to run in the example', async () => {
    // Arrange
    process.chdir(resolveTestResource('example'));
    const sut = createSut();

    // Act
    const actual = await sut.dryRun(factory.dryRunOptions());

    // Assert
    const fileName = 'features/simple_math.feature';
    const expectedTests: Array<Partial<TestResult>> = [
      {
        status: TestStatus.Success,
        id: `${fileName}:7`,
        fileName,
        name: 'Feature: Simple maths -- Scenario: easy maths',
        startPosition: { line: 7, column: 3 },
      },
      {
        status: TestStatus.Success,
        id: `${fileName}:19`,
        name: 'Feature: Simple maths -- Scenario Outline: much more complex stuff [Example L19]',
        fileName,
        startPosition: {
          line: 19,
          column: 7,
        },
      },
      {
        status: TestStatus.Success,
        id: `${fileName}:20`,
        name: 'Feature: Simple maths -- Scenario Outline: much more complex stuff [Example L20]',
        fileName,
        startPosition: {
          line: 20,
          column: 7,
        },
      },
    ];
    assertions.expectTestResults(actual, expectedTests);
  });

  it('should report a failed step as "failed"', async () => {
    // Arrange
    options.cucumber = { tags: '@failed' };
    const sut = createSut();
    process.chdir(resolveTestResource('failure-example'));

    // Act
    const actual = await sut.dryRun(factory.dryRunOptions());

    // Assert
    const fileName = 'features/failure-examples.feature';
    assertions.expectTestResults(actual, [
      {
        id: `${fileName}:4`,
        status: TestStatus.Failed,
        failureMessage: 'Error: Failed step',
        startPosition: { line: 4, column: 3 },
      },
    ]);
  });

  it('should report a not-implemented step as "skipped"', async () => {
    // Arrange
    options.cucumber = { tags: '@not-implemented' };
    const sut = createSut();
    process.chdir(resolveTestResource('failure-example'));

    // Act
    const actual = await sut.dryRun(factory.dryRunOptions());

    // Assert
    const fileName = 'features/failure-examples.feature';
    assertions.expectTestResults(actual, [
      { id: `${fileName}:9`, status: TestStatus.Skipped },
    ]);
  });

  it('should report an ambiguous step as "failed"', async () => {
    // Arrange
    options.cucumber = { tags: '@ambiguous' };
    const sut = createSut();
    process.chdir(resolveTestResource('failure-example'));

    // Act
    const actual = await sut.dryRun(factory.dryRunOptions());

    // Assert
    const fileName = 'features/failure-examples.feature';
    assertions.expectTestResults(actual, [
      {
        id: `${fileName}:14`,
        status: TestStatus.Failed,
        failureMessage: 'Multiple step definitions match:',
      },
    ]);
  });

  it('should report an pending step as "skipped"', async () => {
    // Arrange
    options.cucumber = { tags: '@pending' };
    const sut = createSut();
    process.chdir(resolveTestResource('failure-example'));

    // Act
    const actual = await sut.dryRun(factory.dryRunOptions());

    // Assert
    const fileName = 'features/failure-examples.feature';
    assertions.expectTestResults(actual, [
      { id: `${fileName}:20`, status: TestStatus.Skipped },
    ]);
  });

  it('should report an test case where multiple things went wrong as "failed"', async () => {
    // Arrange
    options.cucumber = { tags: '@multiple-things-wrong' };
    const sut = createSut();
    process.chdir(resolveTestResource('failure-example'));

    // Act
    const actual = await sut.dryRun(factory.dryRunOptions());

    // Assert
    const fileName = 'features/failure-examples.feature';
    assertions.expectTestResults(actual, [
      {
        id: `${fileName}:25`,
        status: TestStatus.Failed,
        failureMessage: 'Error: Failed step',
      },
    ]);
  });
});
