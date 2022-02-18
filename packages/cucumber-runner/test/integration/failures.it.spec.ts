import path from 'path';

import {
  assertions,
  factory,
  testInjector,
} from '@stryker-mutator/test-helpers';

import { TestStatus } from '@stryker-mutator/api/test-runner';

import * as pluginTokens from '../../src/plugin-tokens.js';
import { CucumberTestRunner } from '../../src/index.js';
import { CucumberRunnerWithStrykerOptions } from '../../src/cucumber-runner-with-stryker-options.js';
import { resolveTestResource } from '../helpers/resolve-test-resource.js';

describe('Running cucumber when steps are failing', () => {
  let options: CucumberRunnerWithStrykerOptions;

  let sut: CucumberTestRunner;

  beforeEach(() => {
    process.chdir(resolveTestResource('failure-example'));
    options = testInjector.options as CucumberRunnerWithStrykerOptions;
    options.cucumber = {};
    sut = testInjector.injector
      .provideValue(pluginTokens.globalNamespace, '__stryker2__' as const)
      .injectClass(CucumberTestRunner);
  });

  it('should report a failed step as "failed"', async () => {
    // Arrange
    options.cucumber.tags = ['@failed'];

    // Act
    const actual = await sut.dryRun(factory.dryRunOptions());

    // Assert
    const fileName = path.join('features', 'failure-examples.feature');
    assertions.expectTestResults(actual, [
      {
        id: `${fileName}:4`,
        status: TestStatus.Failed,
        failureMessage: 'Error: Failed step',
        startPosition: { line: 3, column: 3 },
      },
    ]);
  });

  it('should report a not-implemented step as "skipped"', async () => {
    // Arrange
    options.cucumber.tags = ['@not-implemented'];

    // Act
    const actual = await sut.dryRun(factory.dryRunOptions());

    // Assert
    const fileName = path.join('features', 'failure-examples.feature');
    assertions.expectTestResults(actual, [
      { id: `${fileName}:9`, status: TestStatus.Skipped },
    ]);
  });

  it('should report an ambiguous step as "failed"', async () => {
    // Arrange
    options.cucumber.tags = ['@ambiguous'];

    // Act
    const actual = await sut.dryRun(factory.dryRunOptions());

    // Assert
    const fileName = path.join('features', 'failure-examples.feature');
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
    options.cucumber.tags = ['@pending'];

    // Act
    const actual = await sut.dryRun(factory.dryRunOptions());

    // Assert
    const fileName = path.join('features', 'failure-examples.feature');
    assertions.expectTestResults(actual, [
      { id: `${fileName}:20`, status: TestStatus.Skipped },
    ]);
  });

  it('should report a test case where multiple things went wrong as "failed"', async () => {
    // Arrange
    options.cucumber.tags = ['@multiple-things-wrong'];

    // Act
    const actual = await sut.dryRun(factory.dryRunOptions());

    // Assert
    const fileName = path.join('features', 'failure-examples.feature');
    assertions.expectTestResults(actual, [
      {
        id: `${fileName}:25`,
        status: TestStatus.Failed,
        failureMessage: 'Error: Failed step',
      },
    ]);
  });

  it('should correspond the correct failure messages to the responses', async () => {
    // Run all of them, multiple failures
    const actual = await sut.dryRun(factory.dryRunOptions());
    const fileName = path.join('features', 'failure-examples.feature');
    assertions.expectTestResults(actual, [
      {
        id: `${fileName}:4`,
        status: TestStatus.Failed,
        failureMessage: 'Error: Failed step',
      },
      {
        id: `${fileName}:9`,
        status: TestStatus.Skipped,
      },
      {
        id: `${fileName}:14`,
        status: TestStatus.Failed,
        failureMessage: 'Multiple step definitions match:',
      },
      {
        id: `${fileName}:20`,
        status: TestStatus.Skipped,
      },
      {
        id: `${fileName}:25`,
        status: TestStatus.Failed,
        failureMessage: 'Multiple step definitions match:',
      },
      {
        id: `${fileName}:32`,
        name: 'Feature: Failure examples -- Scenario: Second failed step',
        status: TestStatus.Skipped,
      },
    ]);
  });

  it('should report only the first test (bail)', async () => {
    // Arrange
    options.cucumber.tags = ['@failed or @failed2'];

    // Act
    const actual = await sut.dryRun(
      factory.dryRunOptions({ disableBail: false })
    );

    // Assert
    const fileName = path.join('features', 'failure-examples.feature');
    assertions.expectTestResults(actual, [
      {
        id: `${fileName}:4`,
        status: TestStatus.Failed,
        failureMessage: 'Error: Failed step',
        startPosition: { line: 3, column: 3 },
      },
      {
        id: `${fileName}:32`,
        status: TestStatus.Skipped,
        startPosition: { line: 31, column: 3 },
      },
    ]);
  });

  it('should report all failed tests when disableBail is true', async () => {
    // Arrange
    options.cucumber.tags = ['@failed or @failed2'];

    // Act
    const actual = await sut.dryRun(
      factory.dryRunOptions({ disableBail: true })
    );

    // Assert
    const fileName = path.join('features', 'failure-examples.feature');
    assertions.expectTestResults(actual, [
      {
        id: `${fileName}:4`,
        status: TestStatus.Failed,
        failureMessage: 'Error: Failed step',
        startPosition: { line: 3, column: 3 },
      },
      {
        id: `${fileName}:32`,
        status: TestStatus.Failed,
        failureMessage: 'Error: Failed step',
        startPosition: { line: 31, column: 3 },
      },
    ]);
  });
});
