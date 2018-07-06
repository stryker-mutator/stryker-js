import * as net from 'net';
import * as log4js from 'log4js';
import { Subscriber, Observable } from 'rxjs';

export default class LoggingServer {

  private readonly server: net.Server;
  private subscribers: Subscriber<log4js.LoggingEvent>[] = [];
  public readonly event$: Observable<log4js.LoggingEvent>;

  constructor(public readonly port: number) {
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