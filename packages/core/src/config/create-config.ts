import { deepMerge } from '@stryker-mutator/util';
import { StrykerOptions, PartialStrykerOptions } from '@stryker-mutator/api/core';

/**
 * Adds a `set` method to the options object that can be used as a shorthand to
 * override options using a deep merge algorithm. This is mostly for backward compatibility purposes.
 * @param options The stryker options use
 * @deprecated Please use `StrykerOptions` directly instead
 */
export function createConfig(options: StrykerOptions): StrykerOptions {
  options.set = (newConfig: PartialStrykerOptions) => {
    deepMerge(options, newConfig);
  };
  return options;
}
