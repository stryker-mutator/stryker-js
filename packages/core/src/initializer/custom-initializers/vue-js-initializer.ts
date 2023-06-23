import { PartialStrykerOptions } from '@stryker-mutator/api/core';

import { CustomInitializer, CustomInitializerConfiguration } from './custom-initializer.js';

const guideUrl = 'https://stryker-mutator.io/docs/stryker-js/guides/vuejs';

/**
 * More information can be found in the Stryker handbook:
 * https://stryker-mutator.io/docs/stryker-js/guides/vuejs
 */
export class VueJsInitializer implements CustomInitializer {
  public readonly name = 'vue';

  private readonly vitestConf: PartialStrykerOptions = {
    testRunner: 'vitest',
    reporters: ['progress', 'clear-text', 'html'],
  };

  public async createConfig(): Promise<CustomInitializerConfiguration> {
    return {
      config: this.vitestConf,
      dependencies: ['@stryker-mutator/vitest-runner'],
      guideUrl,
    };
  }
}
