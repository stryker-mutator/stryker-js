import * as net from 'net';

import { parse } from 'flatted';
import * as log4js from 'log4js';
import { Observable, Subscriber } from 'rxjs';

export class LoggingServer {
  private readonly server: net.Server;
  private subscriber: Subscriber<log4js.LoggingEvent> | undefined;
  public readonly event$: Observable<log4js.LoggingEvent>;
  private disposed = false;

  constructor() {
    this.server = net.createServer((socket) => {
      socket.on('data', (data) => {
        // Log4js also sends "__LOG4JS__" to signal an event end. Ignore those.
        const logEventStrings = data.toString().split('__LOG4JS__').filter(Boolean);
        const loggingEvents: log4js.LoggingEvent[] = logEventStrings.map((logEventString) => parse(logEventString));
        loggingEvents.forEach((event) => this.subscriber?.next(event));
      });
      socket.on('error', () => {
        // A client connection was killed unexpectedly.
        // This happens during integration tests, this is safe to ignore (log4js does that as well)
      });
    });
    this.event$ = new Observable<log4js.LoggingEvent>((subscriber) => {
      this.subscriber = subscriber;
      this.server.on('close', () => {
        subscriber.complete();
      });
    });
  }

  private alreadyListening = false;
  public listen(): Promise<number> {
    if (this.alreadyListening) {
      throw new Error('Server already listening');
    } else {
      this.alreadyListening = true;
      return new Promise((res) => {
        this.server.on('listening', () => res((this.server.address() as net.AddressInfo).port));
        this.server.listen();
      });
    }
  }

  public dispose(): Promise<void> {
    if (this.disposed) {
      return Promise.resolve();
    } else {
      this.disposed = true;
      return new Promise((res, rej) => {
        this.server.close((err?: Error) => {
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
