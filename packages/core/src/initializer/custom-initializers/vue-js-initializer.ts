import { PartialStrykerOptions } from '@stryker-mutator/api/core';
import { Immutable } from '@stryker-mutator/util';

import {
  CustomInitializer,
  CustomInitializerConfiguration,
} from './custom-initializer.js';

const guideUrl = 'https://stryker-mutator.io/docs/stryker-js/guides/vuejs';

/**
 * More information can be found in the Stryker handbook:
 * https://stryker-mutator.io/docs/stryker-js/guides/vuejs
 */
export class VueJsInitializer implements CustomInitializer {
  public readonly name = 'vue';

  private readonly vitestConf: Immutable<PartialStrykerOptions> = {
    testRunner: 'vitest',
    reporters: ['progress', 'clear-text', 'html'],
  };

  public createConfig(): Promise<CustomInitializerConfiguration> {
    return Promise.resolve({
      config: this.vitestConf,
      dependencies: ['@stryker-mutator/vitest-runner'],
      guideUrl,
    });
  }
}
