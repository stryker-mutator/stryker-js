import * as path from 'path';
import getPort = require('get-port');
import * as log4js from 'log4js';
import { expect } from 'chai';
import { File, LogLevel } from 'stryker-api/core';
import { Logger } from 'stryker-api/logging';
import Echo from './Echo';
import ChildProcessProxy from '../../../src/child-proxy/ChildProcessProxy';
import { Task } from '../../../src/utils/Task';
import LoggingServer from '../../helpers/LoggingServer';
import { filter } from 'rxjs/operators';
import { Mock } from '../../helpers/producers';
import currentLogMock from '../../helpers/logMock';
import { sleep } from '../../helpers/testUtils';
import OutOfMemoryError from '../../../src/child-proxy/OutOfMemoryError';
import ChildProcessCrashedError from '../../../src/child-proxy/ChildProcessCrashedError';

describe('ChildProcessProxy', () => {

  let sut: ChildProcessProxy<Echo>;
  let loggingServer: LoggingServer;
  let log: Mock<Logger>;
  const echoName = 'The Echo Server';
  const workingDir = '..';

  beforeEach(async () => {
    const port = await getPort();
    log = currentLogMock();
    loggingServer = new LoggingServer(port);
    sut = ChildProcessProxy.create(require.resolve('./Echo'), { port, level: LogLevel.Debug }, [], workingDir, Echo, echoName);
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
    expect(actual).eq(`${echoName}: hello`);
  });

  it('should be able to get delayed result', async () => {
    const actual = await sut.proxy.sayDelayed('hello', 2);
    expect(actual).eq(`${echoName}: hello (2 ms)`);
  });

  it('should set the current working directory', async () => {
    const actual = await sut.proxy.cwd();
    expect(actual).eq(path.resolve(workingDir));
  });

  it('should be able to receive files', async () => {
    const actual: string = await sut.proxy.echoFile(new File('hello.txt', 'hello world from file'));
    expect(actual).eq('hello world from file');
  });

  it('should be able to send files', async () => {
    const actual: File = await sut.proxy.readFile();
    expect(actual.textContent).eq('hello foobar');
    expect(actual.name).eq('foobar.txt');
  });

  it('should be able to receive a promise rejection', async () => {
    await expect(sut.proxy.reject('Foobar error')).rejectedWith('Foobar error');
  });

  it('should be able to receive public properties as promised', () => {
    return expect(sut.proxy.name()).eventually.eq(echoName);
  });

  it('should be able to log on debug when LogLevel.Debug is allowed', async () => {
    const logEventTask = new Task<log4js.LoggingEvent>();
    loggingServer.event$.pipe(
      filter(event => event.categoryName === Echo.name)
    ).subscribe(logEventTask.resolve.bind(logEventTask));
    sut.proxy.debug('test message');
    const log = await logEventTask.promise;
    expect(log.categoryName).eq(Echo.name);
    expect(log.data).deep.eq(['test message']);
  });

  it('should not log on trace if LogLevel.Debug is allowed as min log level', async () => {
    const logEventTask = new Task<log4js.LoggingEvent>();
    loggingServer.event$.pipe(
      filter(event => event.categoryName === Echo.name)
    ).subscribe(logEventTask.resolve.bind(logEventTask));
    sut.proxy.trace('foo');
    sut.proxy.debug('bar');
    const log = await logEventTask.promise;
    expect(log.categoryName).eq(Echo.name);
    expect(log.data).deep.eq(['bar']);
    expect(toLogLevel(log.level)).eq(LogLevel.Debug);
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
    expect(call.args[0]).matches(/Child process \[pid \d+\] exited unexpectedly with exit code 12 \(without signal\)\. Last part of stdout and stderr was/g);
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
  return [LogLevel.Debug, LogLevel.Error, LogLevel.Fatal, LogLevel.Information, LogLevel.Off, LogLevel.Trace, LogLevel.Warning].find(level => level === levelName);
}
