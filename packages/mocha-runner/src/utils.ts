import fs from 'fs';

import { MochaOptions } from '../src-generated/mocha-runner-options.js';

const mochaSchema: typeof import('../schema/mocha-runner-options.json') = JSON.parse(
  fs.readFileSync(new URL('../schema/mocha-runner-options.json', import.meta.url), 'utf-8'),
);

export function serializeMochaLoadOptionsArguments(mochaOptions: MochaOptions): string[] {
  const args: string[] = [];
  if (mochaOptions['no-config']) {
    args.push('--no-config');
  }
  if (mochaOptions['no-opts']) {
    args.push('--no-opts');
  }
  if (mochaOptions['no-package']) {
    args.push('--no-package');
  }
  if (mochaOptions.package) {
    args.push('--package');
    args.push(mochaOptions.package);
  }
  if (mochaOptions.opts) {
    args.push('--opts');
    args.push(mochaOptions.opts);
  }
  if (mochaOptions.config) {
    args.push('--config');
    args.push(mochaOptions.config);
  }
  return args;
}

const SUPPORTED_MOCHA_OPTIONS = Object.freeze(Object.keys(mochaSchema.properties.mochaOptions.properties));

/**
 * Filter out those config values that are actually useful to run mocha with Stryker
 * @param rawConfig The raw parsed mocha configuration
 */
export function filterConfig(rawConfig: Record<string, any>): Partial<MochaOptions> {
  const options: Partial<MochaOptions> = {};
  Object.keys(rawConfig)
    .filter((rawOption) => SUPPORTED_MOCHA_OPTIONS.some((supportedOption) => rawOption === supportedOption))
    .forEach((option) => ((options as any)[option] = rawConfig[option]));

  // Config file can also contain positional arguments. They are provided under the `_` key
  // For example:
  // When mocha.opts contains "--async-only test/**/*.js", then "test/**/*.js will be the positional argument
  // We must provide it to mocha as "spec"
  if (rawConfig._?.length) {
    if (!options.spec) {
      options.spec = [];
    }
    const specs = options.spec;
    rawConfig._.forEach((positionalArgument: string) => specs.push(positionalArgument));
  }
  return options;
}
