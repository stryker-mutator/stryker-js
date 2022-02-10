import { JestEnvironment } from '@jest/environment';

import { mixinJestEnvironment } from './mixin-jest-environment.js';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const JestEnvironmentImpl = require(require.resolve('jest-environment-node', { paths: [process.cwd()] })) as typeof JestEnvironment;
export = mixinJestEnvironment(JestEnvironmentImpl);
