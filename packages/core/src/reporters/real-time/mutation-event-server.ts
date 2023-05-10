import { MutantResult } from 'mutation-testing-report-schema';

import { SseServer } from './sse-server.js';
import { SseClient } from './sse-client.js';
import { MutationEventSender } from './mutation-event-sender.js';

export class MutationEventServer {
  #queue = new Set<Partial<MutantResult>>();
  #mutationEventSenders = new Set<MutationEventSender>();
  #sseServer: SseServer;

  constructor(sseServer: SseServer) {
    this.#sseServer = sseServer;
    this.#sseServer.on('client-connected', (client) => this.#handleClientConnected(client));
    this.#sseServer.on('client-disconnected', (client) => this.#handleClientDisconnected(client));
  }

  public start(): void {
    this.#sseServer.start();
  }

  public sendMutantTested(mutant: Partial<MutantResult>): void {
    this.#mutationEventSenders.forEach((sender) => {
      sender.sendMutantTested(mutant);
    });
  }

  public sendFinished(): void {
    this.#mutationEventSenders.forEach((sender) => {
      sender.sendFinished();
    });
  }

  public get port(): number {
    const port = this.#sseServer.port;
    if (port === undefined) {
      throw new Error('Server has not been started yet...');
    }
    return port;
  }

  #handleClientConnected(client: SseClient) {
    this.#mutationEventSenders.add(new MutationEventSender(client));
  }

  #handleClientDisconnected(client: SseClient) {
    this.#mutationEventSenders.delete(new MutationEventSender(client));
  }
}
