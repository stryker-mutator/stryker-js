import { expect } from 'chai';
import Echo from './Echo';
import ChildProcessProxy from '../../../src/child-proxy/ChildProcessProxy';
import { File, LogLevel } from 'stryker-api/core';
import * as net from 'net';
import * as log4js from 'log4js';
import { Observable, Subscriber } from 'rxjs';
import * as getPort from 'get-port';
import Task from '../../../src/utils/Task';

describe('ChildProcessProxy', () => {

  let sut: ChildProcessProxy<Echo>;
  let loggingServer: LoggingServer;

  beforeEach(async () => {
    const port = await getPort();
    loggingServer = new LoggingServer(port);
    sut = ChildProcessProxy.create(require.resolve('./Echo'), { port, level: LogLevel.Debug }, [], Echo, 'World');
  });

  afterEach(async () => {
    await sut.dispose();
    await loggingServer.dispose();
  });

  it('should be able to get direct result', async () => {
    const actual = await sut.proxy.say('hello');
    expect(actual).eq('World: hello');
  });

  it('should be able to get delayed result', async () => {
    const actual = await sut.proxy.sayDelayed('hello', 2);
    expect(actual).eq('World: hello (2 ms)');
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

  it('should be able to receive a promise rejection', () => {
    return expect(sut.proxy.reject('Foobar error')).rejectedWith('Foobar error');
  });

  it('should be able to log on debug when LogLevel.Debug is allowed', async () => {
    const firstLogEventTask = new Task<log4js.LoggingEvent>();
    loggingServer.event$.subscribe(firstLogEventTask.resolve.bind(firstLogEventTask));
    sut.proxy.debug('test message');
    const log = await firstLogEventTask.promise;
    expect(log.categoryName).eq(Echo.name);
    expect(log.data).deep.eq(['test message']);
  });

  it('should not log on trace if LogLevel.Debug is allowed as min log level', async () => {
    const firstLogEventTask = new Task<log4js.LoggingEvent>();
    loggingServer.event$.subscribe(firstLogEventTask.resolve.bind(firstLogEventTask));
    sut.proxy.trace('foo')
    sut.proxy.debug('bar');
    const log = await firstLogEventTask.promise;
    expect(log.categoryName).eq(Echo.name);
    expect(log.data).deep.eq(['bar']);
    expect(toLogLevel(log.level)).eq(LogLevel.Debug);
  });
});

function toLogLevel(level: log4js.Level) {
  const levelName = (level as any).levelStr.toLowerCase();
  return [LogLevel.Debug, LogLevel.Error, LogLevel.Fatal, LogLevel.Information, LogLevel.Off, LogLevel.Trace, LogLevel.Warning].find(level => level === levelName);
}

class LoggingServer {

  private readonly server: net.Server;
  private subscribers: Subscriber<log4js.LoggingEvent>[] = [];
  public readonly event$: Observable<log4js.LoggingEvent>;

  constructor(private port: number) {
    this.server = net.createServer(socket => {
      socket.on('data', data => {
        const str = data.toString();
        try {
          const json = JSON.parse(str);
          this.subscribers.map(sub => sub.next(json));
        } catch {
          // IDLE. Log4js also sends "__LOG4JS__" to signal an event end. Ignore those.
        }
      });
    });
    this.server.listen(this.port);

    this.event$ = new Observable<log4js.LoggingEvent>(subscriber => {
      this.subscribers.push(subscriber);
      this.server.on('close', () => {
        subscriber.complete();
      });
    });
  }

  dispose(): Promise<void> {
    return new Promise((res, rej) => {
      this.server.close((err: Error) => {
        if (err) {
          rej(err);
        } else {
          res();
        }
      });
    });
  }
}