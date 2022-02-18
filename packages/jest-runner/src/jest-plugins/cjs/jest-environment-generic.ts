import type { JestEnvironment, EnvironmentContext } from '@jest/environment';
import type { Config } from '@jest/types';

import { state } from './messaging.js';

import { mixinJestEnvironment } from './mixin-jest-environment.js';

export = function jestEnvironmentGeneric(...args: [Config.ProjectConfig, EnvironmentContext]): JestEnvironment {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const JestEnvironmentImpl = require(require.resolve(state.jestEnvironment, { paths: [process.cwd()] })) as typeof JestEnvironment;
  const StrykerAwareJestEnvironment = mixinJestEnvironment(JestEnvironmentImpl);
  return new StrykerAwareJestEnvironment(...args);
};
