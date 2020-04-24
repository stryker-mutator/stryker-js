import { MochaOptions } from '../src-generated/mocha-runner-options';

import mochaSchema = require('../schema/mocha-runner-options.json');

/**
 * Executes a piece of javascript code in global scope while passing the `require` function
 * @param body The JavaScript to execute
 */
export function evalGlobal(body: string) {
  const fn = new Function('require', body);
  fn(require);
}

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
export function filterConfig(rawConfig: { [key: string]: any }): Partial<MochaOptions> {
  const options: Partial<MochaOptions> = {};
  Object.keys(rawConfig)
    .filter((rawOption) => SUPPORTED_MOCHA_OPTIONS.some((supportedOption) => rawOption === supportedOption))
    .forEach((option) => ((options as any)[option] = rawConfig[option]));

  // Config file can also contain positional arguments. They are provided under the `_` key
  // For example:
  // When mocha.opts contains "--async-only test/**/*.js", then "test/**/*.js will be the positional argument
  // We must provide it to mocha as "spec"
  if (rawConfig._ && rawConfig._.length) {
    if (!options.spec) {
      options.spec = [];
    }
    const specs = options.spec;
    rawConfig._.forEach((positionalArgument: string) => specs.push(positionalArgument));
  }
  return options;
}
