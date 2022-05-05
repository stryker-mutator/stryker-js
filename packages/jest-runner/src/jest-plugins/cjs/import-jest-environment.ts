import type { JestEnvironment } from '@jest/environment';

export function loadJestEnvironment(name: string): typeof JestEnvironment {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const jestEnvironmentModule = require(require.resolve(name, { paths: [process.cwd()] }));

  return jestEnvironmentModule.default ?? jestEnvironmentModule;
}
