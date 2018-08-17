import * as path from 'path';
import { expect } from 'chai';
import * as getPort from 'get-port';
import { RunStatus, RunnerOptions } from 'stryker-api/test_runner';
import * as log4js from 'log4js';
import ResilientTestRunnerFactory from '../../../src/test-runner/ResilientTestRunnerFactory';
import TestRunnerDecorator from '../../../src/test-runner/TestRunnerDecorator';
import { LogLevel } from 'stryker-api/core';
import LoggingServer from '../../helpers/LoggingServer';
import LoggingClientContext from '../../../src/logging/LoggingClientContext';
import { toArray } from 'rxjs/operators';
import { sleep } from '../../helpers/testUtils';

describe('ResilientTestRunnerFactory integration', function () {

  this.timeout(15000);

  let sut: TestRunnerDecorator;
  let options: RunnerOptions;
  const sandboxWorkingDirectory = path.resolve('./test/integration/test-runner');
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
        plugins: [require.resolve('./AdditionalTestRunners')],
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

  function createSut(name: string) {
    sut = ResilientTestRunnerFactory.create(name, options, sandboxWorkingDirectory, loggingContext);
  }

  function arrangeSut(name: string): Promise<void> {
    createSut(name);
    return sut.init();
  }

  function actRun(timeout = 4000) {
    return sut.run({ timeout });
  }

  it('should be able to receive a regex', async () => {
    await arrangeSut('discover-regex');
    const result = await actRun();
    expect(result.status).eq(RunStatus.Complete);
  });

  it('should pass along the coverage result from the test runner behind', async () => {
    await arrangeSut('coverage-reporting');
    const result = await actRun();
    expect(result.coverage).eq('realCoverage');
  });

  it('should pass along the run result', async () => {
    await arrangeSut('direct-resolved');
    const result = await actRun();
    expect(result.status).eq(RunStatus.Complete);
  });

  it('should try to report coverage from the global scope, even when the test runner behind does not', async () => {
    await arrangeSut('direct-resolved');
    const result = await actRun();
    expect(result.coverage).eq('coverageObject');
  });

  it('should resolve in a timeout if the test runner never resolves', async () => {
    await arrangeSut('never-resolved');
    const result = await actRun(1000);
    expect(RunStatus[result.status]).eq(RunStatus[RunStatus.Timeout]);
  });

  it('should be able to recover from a timeout by creating a new child process', async () => {
    await arrangeSut('never-resolved');
    await actRun(1000); // first timeout
    const result = await actRun(1000);
    expect(RunStatus[result.status]).eq(RunStatus[RunStatus.Timeout]);
  });

  it('should convert any `Error` objects to string', async () => {
    await arrangeSut('errored');
    const result = await actRun(1000);
    expect(RunStatus[result.status]).to.be.eq(RunStatus[RunStatus.Error]);
    expect(result.errorMessages).to.have.length(1);
    expect((result.errorMessages as any)[0]).includes('SyntaxError: This is invalid syntax!').and.includes('at ErroredTestRunner.run');
  });

  it('should run only after initialization, even when it is slow', async () => {
    await arrangeSut('slow-init-dispose');
    const result = await actRun(1000);
    expect(RunStatus[result.status]).eq(RunStatus[RunStatus.Complete]);
  });

  it('should be able to run twice in quick succession', async () => {
    await arrangeSut('direct-resolved');
    const result = await actRun();
    expect(RunStatus[result.status]).eq(RunStatus[RunStatus.Complete]);
  });

  it('should reject when `init` of test runner behind rejects', async () => {
    createSut('reject-init');
    await expect(sut.init()).rejectedWith('Init was rejected');
  });

  it('should change the current working directory to the sandbox directory', async () => {
    await arrangeSut('verify-working-folder');
    const result = await actRun();
    expect(result.errorMessages).undefined;
  });

  it('should be able to recover from an async crash', async () => {
    // time-bomb will crash after 500 ms
    await arrangeSut('time-bomb');
    await sleep(550);
    const result = await actRun();
    expect(RunStatus[result.status]).eq(RunStatus[RunStatus.Complete]);
    expect(result.errorMessages).undefined;
  });
  
  it('should report if a crash happens twice', async () => {
    await arrangeSut('proximity-mine');
    const result = await actRun();
    expect(RunStatus[result.status]).eq(RunStatus[RunStatus.Error]);
    expect(result.errorMessages).property('0').contains('Test runner crashed');
  });

  it('should handle asynchronously handled promise rejections from the underlying test runner', async () => {
    const logEvents = loggingServer.event$.pipe(toArray()).toPromise();
    await arrangeSut('async-promise-rejection-handler');
    await actRun();
    await sut.dispose();
    alreadyDisposed = true;
    await loggingServer.dispose();
    const actualLogEvents = await logEvents;
    expect(
      actualLogEvents.find(logEvent =>
        log4js.levels.DEBUG.isEqualTo(logEvent.level)
        && logEvent.data.toString().indexOf('UnhandledPromiseRejectionWarning: Unhandled promise rejection') > -1)
    ).ok;
  });
});


