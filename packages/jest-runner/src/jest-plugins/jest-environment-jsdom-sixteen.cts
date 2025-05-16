import { loadJestEnvironment } from './import-jest-environment.cjs';
import { mixinJestEnvironment } from './mixin-jest-environment.cjs';

const JestEnvironmentImpl = loadJestEnvironment(
  'jest-environment-jsdom-sixteen',
);
export = mixinJestEnvironment(JestEnvironmentImpl);
