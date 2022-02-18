import os from 'os';

import { StrykerOptions } from '@stryker-mutator/api/core';

import { Preset } from './preset.js';
import { PresetConfiguration } from './preset-configuration.js';

const guideUrl = 'https://stryker-mutator.io/docs/stryker-js/guides/angular';

export class AngularPreset implements Preset {
  public readonly name = 'angular-cli';
  // Please keep config in sync with handbook
  private readonly dependencies = ['@stryker-mutator/karma-runner'];
  private readonly config: Partial<StrykerOptions> = {
    mutate: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/test.ts', '!src/environments/*.ts'],
    testRunner: 'karma',
    karma: {
      configFile: 'karma.conf.js',
      projectType: 'angular-cli',
      config: {
        browsers: ['ChromeHeadless'],
      },
    },
    reporters: ['progress', 'clear-text', 'html'],
    concurrency: Math.floor(os.cpus().length / 2),
    // eslint-disable-next-line camelcase
    concurrency_comment: 'Recommended to use about half of your available cores when running stryker with angular',
    coverageAnalysis: 'perTest',
  };

  public async createConfig(): Promise<PresetConfiguration> {
    return { config: this.config, guideUrl, dependencies: this.dependencies };
  }
}
