import path from 'path';

import { expect } from 'chai';
import { TestResult, TestStatus } from '@stryker-mutator/api/test-runner';
import {
  assertions,
  factory,
  TempTestDirectorySandbox,
  testInjector,
} from '@stryker-mutator/test-helpers';
import type { IConfiguration } from '@cucumber/cucumber/api';

import * as pluginTokens from '../../src/plugin-tokens.js';
import { CucumberTestRunner } from '../../src/index.js';
import { CucumberRunnerWithStrykerOptions } from '../../src/cucumber-runner-with-stryker-options.js';

describe('Running in an example project', () => {
  let options: CucumberRunnerWithStrykerOptions;
  let sut: CucumberTestRunner;
  let sandbox: TempTestDirectorySandbox;

  beforeEach(async () => {
    sandbox = new TempTestDirectorySandbox('example');
    await sandbox.init();
    options = testInjector.options as CucumberRunnerWithStrykerOptions;
    options.cucumber = {};
    sut = testInjector.injector
      .provideValue(pluginTokens.globalNamespace, '__stryker2__' as const)
      .injectClass(CucumberTestRunner);
  });
  afterEach(async () => {
    await sandbox.dispose();
  });

  it('should be to run in the example', async () => {
    // Act
    const actual = await sut.dryRun(factory.dryRunOptions());

    // Assert
    const fileName = path.join('features', 'simple_math.feature');
    const expectedTests: Array<Partial<TestResult> & Pick<TestResult, 'id'>> = [
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
    // Arrange
    testInjector.logger.isDebugEnabled.returns(true);
    const expectedConfig: Partial<IConfiguration> = {
      format: [
        new URL('../../src/stryker-formatter.cjs', import.meta.url).href,
      ],
      retry: 0,
      parallel: 0,
      failFast: true,
    };

    // Act
    await sut.dryRun(factory.dryRunOptions());

    // Assert
    expect(testInjector.logger.debug).calledOnce;
    const [actualLogMessage] = testInjector.logger.debug.getCall(0).args;
    const expectedPrefix = `Running cucumber with configuration: (${process.cwd()})`;
    expect(actualLogMessage.startsWith(expectedPrefix)).true;
    const actualConfig: IConfiguration = JSON.parse(
      actualLogMessage.substring(expectedPrefix.length),
    );
    expect(actualConfig).deep.includes(expectedConfig);
  });

  it("shouldn't log if debug isn't enabled", async () => {
    testInjector.logger.isDebugEnabled.returns(false);
    await sut.dryRun(factory.dryRunOptions());
    expect(testInjector.logger.debug).not.called;
  });
});
