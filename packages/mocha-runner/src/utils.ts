import { MochaOptions } from './MochaOptions';

/**
 * Executes a piece of javascript code in global scope while passing the `require` function
 * @param body The JavaScript to execute
 */
export function evalGlobal(body: string) {
  const fn = new Function('require', body);
  fn(require);
}

export function serializeArguments(mochaOptions: MochaOptions) {
  const args: string[] = [];
  Object.keys(mochaOptions).forEach(key => {
    args.push(`--${key}`);
    const value: any = (mochaOptions as any)[key];
    if (typeof value === 'string') {
      args.push(value);
    } else if (Array.isArray(value)) {
      args.push(value.join(','));
    }
  });
  return args;
}

export const mochaOptionsKey = 'mochaOptions';

const SUPPORTED_MOCHA_OPTIONS = Object.freeze([
  'extension',
  'require',
  'timeout',
  'async-only',
  'ui',
  'grep',
  'exclude',
  'spec',
  'file'
]);

/**
 * Filter out those config values that are actually useful to run mocha with Stryker
 * @param rawConfig The raw parsed mocha configuration
 */
export function filterConfig(rawConfig: { [key: string]: any }): MochaOptions {
  const options: MochaOptions = {};
  Object.keys(rawConfig)
    .filter(rawOption => SUPPORTED_MOCHA_OPTIONS.some(supportedOption => rawOption === supportedOption))
    .forEach(option => (options as any)[option] = rawConfig[option]);

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
