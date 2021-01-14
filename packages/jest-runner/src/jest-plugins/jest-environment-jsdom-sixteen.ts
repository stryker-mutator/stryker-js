import { requireResolve } from '@stryker-mutator/util';
import { JestEnvironment } from '@jest/environment';

import { mixinJestEnvironment } from './mixin-jest-environment';

const JestEnvironmentImpl = requireResolve('jest-environment-jsdom-sixteen') as typeof JestEnvironment;
export = mixinJestEnvironment(JestEnvironmentImpl);
