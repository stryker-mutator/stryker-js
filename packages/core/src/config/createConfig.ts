import { deepMerge } from '@stryker-mutator/util/src/deepMerge';
import { StrykerOptions, PartialStrykerOptions } from '@stryker-mutator/api/core';
import { Config } from '@stryker-mutator/api/config';

/**
 * Creates a `Config` object for given options.
 * `Config` is the same as `StrykerOptions`, but with a `set` function that can be used as a shorthand to
 * override options using a deep merge algorithm. This is mostly deprecated.
 * @param options The stryker options use
 * @deprecated Please use `StrykerOptions` directly instead
 */
export function createConfig(options: StrykerOptions): Config {
  const config = options as Config;
  options.set = (newConfig: PartialStrykerOptions) => {
    deepMerge(options, newConfig);
  };
  return config;
}
