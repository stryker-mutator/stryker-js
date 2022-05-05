import type { JestEnvironmentConfig, JestEnvironment, EnvironmentContext } from '@jest/environment';

import { state } from './messaging.js';
import { loadJestEnvironment } from './import-jest-environment.js';
import { mixinJestEnvironment } from './mixin-jest-environment.js';

export = function jestEnvironmentGeneric(...args: [JestEnvironmentConfig, EnvironmentContext]): JestEnvironment {
  const JestEnvironmentImpl = loadJestEnvironment(state.jestEnvironment);
  const StrykerAwareJestEnvironment = mixinJestEnvironment(JestEnvironmentImpl);
  return new StrykerAwareJestEnvironment(...args);
};
