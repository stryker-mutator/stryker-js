import { LogLevel } from '@stryker-mutator/api/core';
import { expect } from 'chai';
import * as log4js from 'log4js';
import { toArray } from 'rxjs/operators';
import { LoggingServer, testInjector, factory } from '@stryker-mutator/test-helpers';

import { TestRunner2, DryRunStatus } from '@stryker-mutator/api/test_runner';

import { expectCompleted, expectErrored } from '@stryker-mutator/test-helpers/src/assertions';

import { LoggingClientContext } from '../../../src/logging';
import { createTestRunnerFactory } from '../../../src/test-runner';
import { sleep } from '../../helpers/testUtils';
import { coreTokens } from '../../../src/di';

describe(`${createTestRunnerFactory.name} integration`, () => {
  let createSut: () => Required<TestRunner2>;
  let sut: Required<TestRunner2>;
  let loggingContext: LoggingClientContext;

  let loggingServer: LoggingServer;
  let alreadyDisposed: boolean;

  beforeEach(async () => {
    // Make sure there is a logging server listening
    loggingServer = new LoggingServer();
    const port = await loggingServer.listen();
    loggingContext = { port, level: LogLevel.Trace };
    testInjector.options.plugins = [require.resolve('./AdditionalTestRunners')];
    testInjector.options.someRegex = /someRegex/;
    testInjector.options.testRunner = 'karma';
    alreadyDisposed = false;
    createSut = testInjector.injector
      .provideValue(coreTokens.sandbox, { sandboxFileNames: ['foo.js'], workingDirectory: __dirname })
      .provideValue(coreTokens.loggingContext, loggingContext)
      .injectFunction(createTestRunnerFactory);
  });

  afterEach(async () => {
    if (!alreadyDisposed) {
      await sut.dispose();
    }
    await loggingServer.dispose();
  });

  async function arrangeSut(name: string): Promise<void> {
    testInjector.options.testRunner = name;
    sut = createSut();
    await sut.init();
  }

  function actDryRun(timeout = 4000) {
    return sut.dryRun({ timeout, coverageAnalysis: 'all' });
  }

  it('should be able to receive a regex', async () => {
    await arrangeSut('discover-regex');
    const result = await actDryRun();
    expect(result.status).eq(DryRunStatus.Complete);
  });

  it('should pass along the coverage result from the test runner behind', async () => {
    await arrangeSut('coverage-reporting');
    const result = await actDryRun();
    expectCompleted(result);
    expect(result.mutantCoverage).deep.eq(factory.mutantCoverage({ static: { 1: 42 } }));
  });

  it('should pass along the run result', async () => {
    await arrangeSut('direct-resolved');
    const result = await actDryRun();
    expect(result.status).eq(DryRunStatus.Complete);
  });

  it('should try to report coverage from the global scope, even when the test runner behind does not', async () => {
    await arrangeSut('direct-resolved');
    const result = await actDryRun();
    expectCompleted(result);
    expect(result.mutantCoverage).eq('coverageObject');
  });

  it('should resolve in a timeout if the test runner never resolves', async () => {
    await arrangeSut('never-resolved');
    const result = await actDryRun(1000);
    expect(result.status).eq(DryRunStatus.Timeout);
  });

  it('should be able to recover from a timeout by creating a new child process', async () => {
    await arrangeSut('never-resolved');
    await actDryRun(1000); // first timeout
    const result = await actDryRun(1000);
    expect(result.status).eq(DryRunStatus.Timeout);
  });

  it('should convert any `Error` objects to string', async () => {
    await arrangeSut('errored');
    const result = await actDryRun(1000);
    expectErrored(result);
    expect(result.errorMessage).includes('SyntaxError: This is invalid syntax!').and.includes('at ErroredTestRunner.dryRun');
  });

  it('should run only after initialization, even when it is slow', async () => {
    await arrangeSut('slow-init-dispose');
    const result = await actDryRun(1000);
    expectCompleted(result);
  });

  it('should be able to run twice in quick succession', async () => {
    await arrangeSut('direct-resolved');
    const result = await actDryRun();
    expectCompleted(result);
  });

  it('should reject when `init` of test runner behind rejects', async () => {
    await expect(arrangeSut('reject-init')).rejectedWith('Init was rejected');
  });

  it('should change the current working directory to the sandbox directory', async () => {
    await arrangeSut('verify-working-folder');
    const result = await actDryRun();
    expectCompleted(result);
  });

  it('should be able to recover from an async crash', async () => {
    // time-bomb will crash after 500 ms
    await arrangeSut('time-bomb');
    await sleep(550);
    const result = await actDryRun();
    expectCompleted(result);
  });

  it('should report if a crash happens twice', async () => {
    await arrangeSut('proximity-mine');
    const result = await actDryRun();
    expectErrored(result);
    expect(result.errorMessage).contains('Test runner crashed');
  });

  it('should handle asynchronously handled promise rejections from the underlying test runner', async () => {
    const logEvents = loggingServer.event$.pipe(toArray()).toPromise();
    await arrangeSut('async-promise-rejection-handler');
    await actDryRun();
    await sut.dispose();
    alreadyDisposed = true;
    await loggingServer.dispose();
    const actualLogEvents = await logEvents;
    expect(
      actualLogEvents.find(
        (logEvent) =>
          log4js.levels.DEBUG.isEqualTo(logEvent.level) &&
          logEvent.data.toString().includes('UnhandledPromiseRejectionWarning: Unhandled promise rejection')
      )
    ).ok;
  });
});
