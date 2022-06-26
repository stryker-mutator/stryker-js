import path from 'path';
import { URL } from 'url';

import { FileDescriptions, LogLevel } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { testInjector, LoggingServer } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import log4js from 'log4js';
import { filter } from 'rxjs/operators';
import { Task } from '@stryker-mutator/util';

import { ChildProcessCrashedError } from '../../../src/child-proxy/child-process-crashed-error.js';
import { ChildProcessProxy } from '../../../src/child-proxy/child-process-proxy.js';
import { OutOfMemoryError } from '../../../src/child-proxy/out-of-memory-error.js';
import { currentLogMock } from '../../helpers/log-mock.js';
import { Mock } from '../../helpers/producers.js';
import { sleep } from '../../helpers/test-utils.js';

import { Echo } from './echo.js';

describe(ChildProcessProxy.name, () => {
  let sut: ChildProcessProxy<Echo>;
  let loggingServer: LoggingServer;
  let log: Mock<Logger>;
  let fileDescriptions: FileDescriptions;
  const testRunnerName = 'echoRunner';
  const workingDir = '..';

  beforeEach(async () => {
    fileDescriptions = {
      'src/foo.js': { mutate: true },
      'src/foo.spec.js': { mutate: false },
    };
    loggingServer = new LoggingServer();
    const port = await loggingServer.listen();
    testInjector.options.testRunner = testRunnerName;
    log = currentLogMock();
    sut = ChildProcessProxy.create(
      new URL('./echo.js', import.meta.url).toString(),
      { port, level: LogLevel.Debug },
      testInjector.options,
      fileDescriptions,
      [],
      workingDir,
      Echo,
      [
        '--no-warnings', // test if node args are forwarded with this setting, see https://nodejs.org/api/cli.html#cli_no_warnings
        '--max-old-space-size=32', // reduce the amount of time we have to wait on the OOM test
      ]
    );
  });

  afterEach(async () => {
    try {
      await sut.dispose();
      await loggingServer.dispose();
    } catch (error) {
      console.error(error);
    }
  });

  it('should be able to get direct result', async () => {
    const actual = await sut.proxy.say('hello');
    expect(actual).eq(`${testRunnerName}: hello`);
  });

  it('should be able to get delayed result', async () => {
    const actual = await sut.proxy.sayDelayed('hello', 2);
    expect(actual).eq(`${testRunnerName}: hello (2 ms)`);
  });

  it('should provide fileDescriptions correctly', async () => {
    const actual = await sut.proxy.echoFiles();
    expect(actual).deep.eq(fileDescriptions);
  });

  it('should set the current working directory', async () => {
    const actual = await sut.proxy.cwd();
    expect(actual).eq(path.resolve(workingDir));
  });

  it('should use `execArgv` to start the child process', async () => {
    await sut.proxy.warning();
    expect(sut.stderr).not.includes('Foo warning');
  });

  it('should be able to receive a promise rejection', async () => {
    await expect(sut.proxy.reject('Foobar error')).rejectedWith('Foobar error');
  });

  it('should be able to receive public properties as promised', async () => {
    expect(await sut.proxy.testRunnerName()).eq(testRunnerName);
  });

  it('should be able to log on debug when LogLevel.Debug is allowed', async () => {
    const logEventTask = new Task<log4js.LoggingEvent>();
    loggingServer.event$.pipe(filter((event) => event.categoryName === Echo.name)).subscribe(logEventTask.resolve.bind(logEventTask));
    await sut.proxy.debug('test message');
    const logger = await logEventTask.promise;
    expect(logger.categoryName).eq(Echo.name);
    expect(logger.data).deep.eq(['test message']);
  });

  it('should not log on trace if LogLevel.Debug is allowed as min log level', async () => {
    const logEventTask = new Task<log4js.LoggingEvent>();
    loggingServer.event$.pipe(filter((event) => event.categoryName === Echo.name)).subscribe(logEventTask.resolve.bind(logEventTask));
    await sut.proxy.trace('foo');
    await sut.proxy.debug('bar');
    const logger = await logEventTask.promise;
    expect(logger.categoryName).eq(Echo.name);
    expect(logger.data).deep.eq(['bar']);
    expect(toLogLevel(logger.level)).eq(LogLevel.Debug);
  });

  it('should reject when the child process exits', () => {
    return expect(sut.proxy.exit(42)).rejectedWith(ChildProcessCrashedError);
  });

  it('should log stdout and stderr on warning when a child process crashed', async () => {
    await sut.proxy.stdout('stdout message');
    await sut.proxy.stderr('stderr message');
    // Give nodejs the chance to flush the stdout and stderr buffers
    await sleep(10);
    await expect(sut.proxy.exit(12)).rejected;
    const call = log.warn.getCall(0);
    expect(call.args[0]).matches(
      /Child process \[pid \d+\] exited unexpectedly with exit code 12 \(without signal\)\. Last part of stdout and stderr was/g
    );
    expect(call.args[0]).includes('stdout message');
    expect(call.args[0]).includes('stderr message');
  });

  it('should immediately reject any subsequent calls when the child process exits', async () => {
    await expect(sut.proxy.exit(1)).rejected;
    await expect(sut.proxy.say('something')).rejectedWith(ChildProcessCrashedError);
  });

  it('should throw an OutOfMemoryError if the process went out-of-memory', async () => {
    await expect(sut.proxy.memoryLeak()).rejectedWith(OutOfMemoryError);
  });
});

function toLogLevel(level: log4js.Level) {
  const levelName = (level as any).levelStr.toLowerCase();
  return [LogLevel.Debug, LogLevel.Error, LogLevel.Fatal, LogLevel.Information, LogLevel.Off, LogLevel.Trace, LogLevel.Warning].find(
    (logLevel) => logLevel === levelName
  );
}
