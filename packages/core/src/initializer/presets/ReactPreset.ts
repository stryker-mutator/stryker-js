import { StrykerOptions } from '@stryker-mutator/api/core';

import Preset from './Preset';
import PresetConfiguration from './PresetConfiguration';

const handbookUrl = 'https://github.com/stryker-mutator/stryker-handbook/blob/master/stryker/guides/react.md#react';

/**
 * More information can be found in the Stryker handbook:
 * https://github.com/stryker-mutator/stryker-handbook/blob/master/stryker/guides/react.md#react
 */
export class ReactPreset implements Preset {
  public readonly name = 'create-react-app';
  private readonly dependencies = ['@stryker-mutator/jest-runner'];

  private readonly config: Partial<StrykerOptions> = {
    testRunner: 'jest',
    reporters: ['progress', 'clear-text', 'html'],
    coverageAnalysis: 'off',
    jest: {
      projectType: 'create-react-app',
    },
  };

  public async createConfig(): Promise<PresetConfiguration> {
    return { config: this.config, handbookUrl, dependencies: this.dependencies };
  }
}
