import NodeEnvironment from 'jest-environment-node';
import type { JestEnvironmentConfig, EnvironmentContext } from '@jest/environment';
import type { Circus } from '@jest/types';

class JestTestEnvironment extends NodeEnvironment {
  public events: string[] = [];

  constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
    super(config, context);
    this.global.__strykerGlobalNamespace__ = '__stryker2__';
  }

  public handleTestEvent(event: Circus.Event): void {
    this.events.push(event.name);
  }
}

export = JestTestEnvironment;
