import EventEmitter from 'events';
import type { ServerResponse } from 'http';

export class SseClient extends EventEmitter {
  #response: ServerResponse;

  constructor(res: ServerResponse) {
    super();

    this.#response = res;
    this.#response.on('finish', () => this.emit('writing-finished'));
  }

  public on(eventType: 'writing-finished', callback: () => void): this {
    return super.on(eventType, callback);
  }

  public emit(eventType: 'writing-finished'): boolean {
    return super.emit(eventType);
  }

  public send<T>(event: string, payload: T): void {
    this.#response.write(`event: ${event}\n`);
    this.#response.write(`data: ${JSON.stringify(payload)}\n\n`);
  }

  public close(): void {
    this.#response.destroy();
  }
}
