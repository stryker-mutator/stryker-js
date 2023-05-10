import EventEmitter from 'events';
import { type Server, createServer, type ServerResponse } from 'http';

import { AddressInfo } from 'net';

import { SseClient } from './sse-client.js';

export class SseServer extends EventEmitter {
  public port?: number;

  #server: Server;
  #clients = new Set<SseClient>();

  constructor() {
    super();

    this.#server = createServer();
    this.#server.on('request', (_, res) => this.#handleRequest(res));
  }

  public on(eventType: 'client-connected' | 'client-disconnected', callback: (client: SseClient) => void): this {
    return super.on(eventType, callback);
  }

  public emit(eventType: 'client-connected' | 'client-disconnected', client: SseClient): boolean {
    return super.emit(eventType, client);
  }

  public start(): void {
    this.#server.listen();
    this.port = (this.#server.address() as AddressInfo).port;
  }

  public stop(): void {
    this.#clients.forEach((c) => {
      c.close();
      this.#clients.delete(c);
    });
  }

  #handleRequest(res: ServerResponse) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    const client = new SseClient(res);

    this.#clients.add(client);

    this.emit('client-connected', client);

    res.on('close', () => this.#handleClose(client));
  }

  #handleClose(client: SseClient) {
    this.emit('client-disconnected', client);
    this.#clients.delete(client);
  }
}
