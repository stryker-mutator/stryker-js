import type { JestEnvironment } from '@jest/environment';

import { state } from './messaging.cjs';

export function loadJestEnvironment(name: string): typeof JestEnvironment {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const jestEnvironmentModule = require(
    require.resolve(name, { paths: [state.resolveFromDirectory] }),
  );

  return jestEnvironmentModule.default ?? jestEnvironmentModule;
}
