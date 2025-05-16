import path from 'path';

import { StrykerOptions } from '@stryker-mutator/api/core';
import { commonTokens } from '@stryker-mutator/api/plugin';
import type { requireResolve } from '@stryker-mutator/util';
import type * as jestModule from 'jest';

import { JestRunnerOptionsWithStrykerOptions } from '../jest-runner-options-with-stryker-options.js';
import { pluginTokens } from '../plugin-di.js';

export function determineResolveFromDirectory(
  options: StrykerOptions,
  resolve: (moduleId: string) => string,
): string {
  return (options as JestRunnerOptionsWithStrykerOptions).jest.projectType ===
    'create-react-app'
    ? path.join(resolve('react-scripts/package.json'), '..')
    : process.cwd();
}
determineResolveFromDirectory.inject = [
  commonTokens.options,
  pluginTokens.resolve,
] as const;

type RunCli = typeof jestModule.runCLI;
type GetVersion = typeof jestModule.getVersion;

/**
 * Direct stubbing on jest is no longer possible since jest > 25
 */
export class JestWrapper {
  private readonly jest: typeof jestModule;

  public static readonly inject = [
    pluginTokens.resolveFromDirectory,
    pluginTokens.requireFromCwd,
  ] as const;

  constructor(
    resolveFromDirectory: string,
    requireFrom: typeof requireResolve,
  ) {
    // Use requireResolve, that way you can use this plugin from a different directory
    this.jest = requireFrom('jest', resolveFromDirectory) as typeof jestModule;
  }

  public runCLI(
    ...args: Parameters<typeof jestModule.runCLI>
  ): ReturnType<RunCli> {
    return this.jest.runCLI(...args);
  }
  public getVersion(...args: Parameters<GetVersion>): ReturnType<GetVersion> {
    return this.jest.getVersion(...args);
  }
}
