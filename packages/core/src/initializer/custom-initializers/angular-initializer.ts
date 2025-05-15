import os from 'os';
import fs from 'fs/promises';

import type { execaCommand } from 'execa';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { Immutable, type resolveFromCwd } from '@stryker-mutator/util';
import { commonTokens } from '@stryker-mutator/api/plugin';
import { Logger } from '@stryker-mutator/api/logging';

import semver from 'semver';

import { fileUtils } from '../../utils/file-utils.js';
import { coreTokens } from '../../di/index.js';

import {
  CustomInitializer,
  CustomInitializerConfiguration,
} from './custom-initializer.js';

const guideUrl = 'https://stryker-mutator.io/docs/stryker-js/guides/angular';

const karmaConfigFile = 'karma.conf.js';

export class AngularInitializer implements CustomInitializer {
  public static inject = [
    commonTokens.logger,
    coreTokens.execa,
    coreTokens.resolveFromCwd,
  ] as const;
  constructor(
    private readonly log: Logger,
    private readonly execa: typeof execaCommand,
    private readonly resolve: typeof resolveFromCwd,
  ) {}

  public readonly name = 'angular-cli';
  // Please keep config in sync with handbook
  private readonly dependencies = ['@stryker-mutator/karma-runner'];
  private readonly config: Immutable<Partial<StrykerOptions>> = {
    mutate: [
      'src/**/*.ts',
      '!src/**/*.spec.ts',
      '!src/test.ts',
      '!src/environments/*.ts',
    ],
    testRunner: 'karma',
    karma: {
      configFile: karmaConfigFile,
      projectType: 'angular-cli',
      config: {
        browsers: ['ChromeHeadless'],
      },
    },
    reporters: ['progress', 'clear-text', 'html'],
    ignorers: ['angular'],
    concurrency: Math.floor(os.cpus().length / 2),

    concurrency_comment:
      'Recommended to use about half of your available cores when running stryker with angular',
    coverageAnalysis: 'perTest',
  };

  public async createConfig(): Promise<CustomInitializerConfiguration> {
    const [karmaConfigExists, ngVersionOutput] = await Promise.all([
      fileUtils.exists(karmaConfigFile),
      this.getCurrentAngularVersion(),
    ]);
    if (
      !karmaConfigExists &&
      ngVersionOutput &&
      semver.gte(ngVersionOutput, '15.1.0')
    ) {
      const command = 'npx ng generate config karma';
      this.log.info(
        `No "karma.conf.js" file found, running command: "${command}"`,
      );
      const { stdout } = await this.execa(command);
      this.log.info(`\n${stdout}`);
    }
    return { config: this.config, guideUrl, dependencies: this.dependencies };
  }

  private async getCurrentAngularVersion(): Promise<string | undefined> {
    try {
      const packageLocation = this.resolve('@angular/cli/package.json');
      return JSON.parse(await fs.readFile(packageLocation, 'utf8')).version;
    } catch (err) {
      const error = err as Error;
      this.log.warn(
        `Could not discover your local angular-cli version. Continuing without generating karma configuration. ${error.stack}`,
      );
      return undefined;
    }
  }
}
