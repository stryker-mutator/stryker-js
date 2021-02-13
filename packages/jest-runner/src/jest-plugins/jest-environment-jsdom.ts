import { JestEnvironment } from '@jest/environment';
import { requireResolve } from '@stryker-mutator/util';

import { mixinJestEnvironment } from './mixin-jest-environment';

const JestEnvironmentImpl = requireResolve('jest-environment-jsdom') as typeof JestEnvironment;
export = mixinJestEnvironment(JestEnvironmentImpl);
