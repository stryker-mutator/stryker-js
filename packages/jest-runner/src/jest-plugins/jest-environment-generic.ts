import type { JestEnvironment, EnvironmentContext } from '@jest/environment';
import type { Config } from '@jest/types';
import { requireResolve } from '@stryker-mutator/util';

import { state } from '../messaging';

import { mixinJestEnvironment } from './mixin-jest-environment';

export = function jestEnvironmentGeneric(...args: [Config.ProjectConfig, EnvironmentContext]): JestEnvironment {
  const JestEnvironmentImpl = requireResolve(state.jestEnvironment) as typeof JestEnvironment;
  const StrykerAwareJestEnvironment = mixinJestEnvironment(JestEnvironmentImpl);
  return new StrykerAwareJestEnvironment(...args);
};
