import { MutantResult } from '@stryker-mutator/api/core';

import { SseClient } from './sse-client.js';

export class MutationEventSender {
  #client: SseClient;

  constructor(client: SseClient) {
    this.#client = client;
  }

  public sendMutantTested(mutant: Partial<MutantResult>): void {
    this.#client.send('mutant-tested', mutant);
  }

  public sendFinished(): void {
    this.#client.send('finished', {});
  }
}
