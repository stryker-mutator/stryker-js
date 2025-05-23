import { StrykerOptions } from '@stryker-mutator/api/core';
import { Immutable } from '@stryker-mutator/util';

import {
  CustomInitializer,
  CustomInitializerConfiguration,
} from './custom-initializer.js';

const guideUrl = 'https://stryker-mutator.io/docs/stryker-js/guides/react';

/**
 * More information can be found in the Stryker handbook:
 * https://stryker-mutator.io/docs/stryker-js/guides/react
 */
export class ReactInitializer implements CustomInitializer {
  public readonly name = 'create-react-app';
  private readonly dependencies = ['@stryker-mutator/jest-runner'];

  private readonly config: Immutable<Partial<StrykerOptions>> = {
    testRunner: 'jest',
    reporters: ['progress', 'clear-text', 'html'],
    coverageAnalysis: 'off',
    jest: {
      projectType: 'create-react-app',
    },
  };

  public createConfig(): Promise<CustomInitializerConfiguration> {
    return Promise.resolve({
      config: this.config,
      guideUrl,
      dependencies: this.dependencies,
    });
  }
}
