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
    args.push((mochaOptions as any)[key].toString());
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
  'file'
]);

/**
 * Filter out those config values that are actually useful to run mocha with Stryker
 * @param rawConfig The raw parsed mocha configuration
 */
export function filterConfig(rawConfig: { [key: string]: any }): MochaOptions {
  return Object.keys(rawConfig).reduce((options, nextValue) => {
    if (SUPPORTED_MOCHA_OPTIONS.some(o => nextValue === o)) {
      (options as any)[nextValue] = (rawConfig as any)[nextValue];
    }
    return options;
  }, {} as MochaOptions);
}
