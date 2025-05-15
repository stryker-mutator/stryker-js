import { createRequire } from 'module';

import type jestConfig from 'jest-config';

import { pluginTokens } from '../plugin-di.js';

const require = createRequire(import.meta.url);

export class JestConfigWrapper {
  private readonly jestConfig: typeof jestConfig;

  public static readonly inject = [pluginTokens.resolveFromDirectory] as const;

  constructor(resolveFromDirectory: string) {
    // Use requireResolve, that way you can use this plugin from a different directory
    const requireFromJest = createRequire(
      require.resolve('jest', { paths: [resolveFromDirectory] }),
    );
    const requireFromJestCli = createRequire(
      requireFromJest.resolve('jest-cli'),
    );
    this.jestConfig = requireFromJestCli('jest-config');
  }

  public readInitialOptions(
    ...args: Parameters<typeof jestConfig.readInitialOptions>
  ): ReturnType<typeof jestConfig.readInitialOptions> {
    return this.jestConfig.readInitialOptions(...args);
  }
}
