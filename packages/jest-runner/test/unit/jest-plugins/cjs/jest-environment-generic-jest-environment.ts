import NodeEnvironment from 'jest-environment-node';
import { Event } from '@jest/types/build/Circus';

class JestTestEnvironment extends NodeEnvironment {
  public events: string[] = [];

  public handleTestEvent(event: Event): void {
    this.events.push(event.name);
  }
}

export = JestTestEnvironment;
