import NodeEnvironment from 'jest-environment-node';
import { Event } from '@jest/types/build/Circus';
import { Config } from '@jest/types';

import * as constants from '../../../src/jest-plugins/constants';

class JestTestEnvironment extends NodeEnvironment {
  public events: string[] = [];

  constructor(config: Config.ProjectConfig) {
    super(config);
    this.global.__strykerGlobalNamespace__ = constants.namespaceAlternative;
  }

  public handleTestEvent(event: Event): void {
    this.events.push(event.name);
  }
}

export = JestTestEnvironment;
