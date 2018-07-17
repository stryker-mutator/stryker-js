import * as net from 'net';
import * as log4js from 'log4js';
import { Subscriber, Observable } from 'rxjs';

export default class LoggingServer {

  private readonly server: net.Server;
  private subscriber: Subscriber<log4js.LoggingEvent> | undefined;
  public readonly event$: Observable<log4js.LoggingEvent>;
  private disposed = false;

  constructor(public readonly port: number) {
    this.server = net.createServer(socket => {
      socket.on('data', data => {
        // Log4js also sends "__LOG4JS__" to signal an event end. Ignore those.
        const logEventStrings = data.toString().split('__LOG4JS__').filter(Boolean);
        const loggingEvents: log4js.LoggingEvent[] = logEventStrings.map(logEventString => JSON.parse(logEventString));
        loggingEvents.forEach(event => this.subscriber && this.subscriber.next(event));
      });
    });
    this.server.listen(this.port);

    this.event$ = new Observable<log4js.LoggingEvent>(subscriber => {
      this.subscriber = subscriber;
      this.server.on('close', () => {
        subscriber.complete();
      });
    });
  }

  dispose(): Promise<void> {
    if (this.disposed) {
      return Promise.resolve();
    } else {
      this.disposed = true;
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
}