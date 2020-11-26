import { requireResolve } from '@stryker-mutator/util';
import { JestEnvironment } from '@jest/environment';

import { jestEnvironmentFactory } from './jest-environment-factory';

const JestEnvironmentImpl = requireResolve('jest-environment-jsdom-sixteen') as typeof JestEnvironment;
export = jestEnvironmentFactory(JestEnvironmentImpl);
