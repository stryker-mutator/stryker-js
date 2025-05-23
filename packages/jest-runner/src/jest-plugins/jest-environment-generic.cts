import type {
  JestEnvironmentConfig,
  JestEnvironment,
  EnvironmentContext,
} from '@jest/environment';

import { state } from './messaging.cjs';
import { loadJestEnvironment } from './import-jest-environment.cjs';
import { mixinJestEnvironment } from './mixin-jest-environment.cjs';

export = function jestEnvironmentGeneric(
  ...args: [JestEnvironmentConfig, EnvironmentContext]
): JestEnvironment {
  const JestEnvironmentImpl = loadJestEnvironment(state.jestEnvironment);
  const StrykerAwareJestEnvironment = mixinJestEnvironment(JestEnvironmentImpl);
  return new StrykerAwareJestEnvironment(...args);
};
