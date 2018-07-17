import * as path from 'path';
import { expect } from 'chai';
import * as getPort from 'get-port';
import { RunStatus, RunnerOptions } from 'stryker-api/test_runner';
import * as log4js from 'log4js';
import ResilientTestRunnerFactory from '../../../src/isolated-runner/ResilientTestRunnerFactory';
import TestRunnerDecorator from '../../../src/isolated-runner/TestRunnerDecorator';
import { LogLevel } from 'stryker-api/core';
import LoggingServer from '../../helpers/LoggingServer';
import LoggingClientContext from '../../../src/logging/LoggingClientContext';
import { toArray } from 'rxjs/operators';

function sleep(ms: number) {
  return new Promise(res => {
    setTimeout(res, ms);
  });
}

describe('ResilientTestRunnerFactory integration', function () {

  this.timeout(15000);

  let sut: TestRunnerDecorator;
  let options: RunnerOptions;
  const sandboxWorkingDirectory = path.resolve('./test/integration/isolated-runner');
  let loggingContext: LoggingClientContext;

  let loggingServer: LoggingServer;
  let alreadyDisposed: boolean;

  beforeEach(async () => {
    // Make sure there is a logging server listening
    const port = await getPort();
    loggingServer = new LoggingServer(port);
    loggingContext = { port, level: LogLevel.Trace };
    options = {
      strykerOptions: {
        plugins: ['../../test/integration/isolated-runner/AdditionalTestRunners'],
        testRunner: 'karma',
        testFramework: 'jasmine',
        port: 0,
        'someRegex': /someRegex/
      },
      port: 0,
      fileNames: []
    };
    alreadyDisposed = false;
  });

  afterEach(async () => {
    if (!alreadyDisposed) {
      await sut.dispose();
    }
    await loggingServer.dispose();
  });

  function arrangeSut(name: string): TestRunnerDecorator {
    return sut = ResilientTestRunnerFactory.create(name, options, sandboxWorkingDirectory, loggingContext);
  }

  function actRun(timeout = 4000) {
    return sut.run({ timeout });
  }

  it('should be able to receive a regex', async () => {
    sut = arrangeSut('discover-regex');
    const result = await actRun();
    expect(result.status).eq(RunStatus.Complete);
  });

  it('should pass along the coverage result from the test runner behind', async () => {
    sut = arrangeSut('coverage-reporting');
    const result = await actRun();
    expect(result.coverage).eq('realCoverage');
  });

  it('should pass along the run result', async () => {
    sut = arrangeSut('direct-resolved');
    const result = await actRun();
    expect(result.status).eq(RunStatus.Complete);
  });

  it('should try to report coverage from the global scope, even when the test runner behind does not', async () => {
    sut = arrangeSut('direct-resolved');
    const result = await actRun();
    expect(result.coverage).eq('coverageObject');
  });

  it('should resolve in a timeout if the test runner never resolves', async () => {
    sut = arrangeSut('never-resolved');
    await sut.init();
    const result = await actRun(1000);
    expect(RunStatus[result.status]).eq(RunStatus[RunStatus.Timeout]);
  });

  it('should be able to recover from a timeout by creating a new child process', async () => {
    sut = arrangeSut('never-resolved');
    await sut.init();
    await actRun(1000); // first timeout
    const result = await actRun(1000);
    expect(RunStatus[result.status]).eq(RunStatus[RunStatus.Timeout]);
  });

  it('should convert any `Error` objects to string', async () => {
    sut = arrangeSut('errored');
    await sut.init();
    const result = await actRun(1000);
    expect(RunStatus[result.status]).to.be.eq(RunStatus[RunStatus.Error]);
    expect(result.errorMessages).to.have.length(1);
    expect((result.errorMessages as any)[0]).includes('SyntaxError: This is invalid syntax!').and.includes('at ErroredTestRunner.run');
  });

  it('should run only after initialization, even when it is slow', async () => {
    sut = arrangeSut('slow-init-dispose');
    await sut.init();
    const result = await actRun(1000);
    expect(RunStatus[result.status]).eq(RunStatus[RunStatus.Complete]);
  });

  it('should be able to run twice in quick succession', async () => {
    sut = arrangeSut('direct-resolved');
    await actRun();
    const result = await actRun();
    expect(RunStatus[result.status]).eq(RunStatus[RunStatus.Complete]);
  });

  it('should reject when `init` of test runner behind rejects', () => {
    sut = arrangeSut('reject-init');
    return expect(sut.init()).rejectedWith('Init was rejected');
  });

  it('should change the current working directory to the sandbox directory', async () => {
    sut = arrangeSut('verify-working-folder');
    const result = await actRun();
    expect(result.errorMessages).undefined;
  });

  it('should be able to recover from any crash', async () => {
    // time-bomb will crash after 100 ms
    sut = arrangeSut('time-bomb');
    await sleep(101);
    const result = await actRun();
    expect(RunStatus[result.status]).eq(RunStatus[RunStatus.Complete]);
    expect(result.errorMessages).undefined;
  });

  it('should handle asynchronously handled promise rejections from the underlying test runner', async () => {
    const logEvents = loggingServer.event$.pipe(toArray()).toPromise();
    sut = arrangeSut('async-promise-rejection-handler');
    await sut.init();
    await actRun();
    await sut.dispose();
    alreadyDisposed = true;
    await loggingServer.dispose();
    const actualLogEvents = await logEvents;
    expect(actualLogEvents.find(logEvent =>
      log4js.levels.DEBUG.isEqualTo(logEvent.level) && logEvent.data.toString().indexOf('UnhandledPromiseRejectionWarning: Unhandled promise rejection') > -1)).ok;
  });
});


