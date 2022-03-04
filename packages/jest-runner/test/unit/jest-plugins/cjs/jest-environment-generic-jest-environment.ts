import NodeEnvironment from 'jest-environment-node';
import type { Event } from '@jest/types/build/Circus';
import type { Config } from '@jest/types';

class JestTestEnvironment extends NodeEnvironment {
  public events: string[] = [];

  constructor(config: Config.ProjectConfig) {
    super(config);
    this.global.__strykerGlobalNamespace__ = '__stryker2__';
  }

  public handleTestEvent(event: Event): void {
    this.events.push(event.name);
  }
}

export = JestTestEnvironment;
