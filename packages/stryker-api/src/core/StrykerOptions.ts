import InputFileDescriptor from './InputFileDescriptor';

interface StrykerOptions {
  // this ensures that custom config for for example 'karma' can be added under the 'karma' key
  [customConfig: string]: any;

  /**
   * The files array determines which files are in scope for mutation testing.
   * These include library files, test files and files to mutate, but should NOT include test framework files (for example jasmine).
   * Each element can be either a string or an object with 2 properties
   * * `string`: A globbing expression used for selecting the files needed to run the tests.
   * * { pattern: 'pattern', included: true } :
   *    * The `pattern` property is mandatory and contains the globbing expression used for selecting the files
   *    * The `included` property is optional and determines whether or not this file should be loaded initially by the test-runner (default: true)
   *    * The `mutated` property is optional and determines whether or not this file should be targeted for mutations (default: false)
   *
   * @example
   *     files: ['test/helpers/**\/*.js', 'test/unit/**\/*.js', { pattern: 'src/**\/*.js', included: false }],
   */
  files?: Array<string | InputFileDescriptor>;

  /**
   * A list of globbing expression used for selecting the files that should be mutated.
   */
  mutate?: string[];

  /**
   * Specify the maximum number of concurrent test runners. Useful if you don't want to use
   * all the CPU cores of your machine. Default: infinity, Stryker will decide for you and tries to use
   * all CPUs in your machine optimally.
   */
  maxConcurrentTestRunners?: number;

  /**
   * A location to a config file. That file should export a function which accepts a "config" object which it uses to configure stryker
   */
  configFile?: string;

  /**
   * Options to pass to the reporter
   */
  reporterOptions?: Object;

  /**
   * The name of the test framework to use
   */
  testFramework?: string;

  /**
   * The name of the test runner to use (default is the same name as the testFramework)
   */
  testRunner?: string;

  /**
   * Indicates which coverage analysis strategy to use.
   * During mutation testion, stryker will try to only run the tests that cover a particular line of code.
   *
   * 'perTest' (default): Analyse coverage per test.
   * 'all': Analyse the coverage for the entire test suite.
   * 'off': Don't use coverage analysis
   */
  coverageAnalysis?: 'perTest' | 'all' | 'off';

  /**
   * The name (or names) of the reporter to use
   * Possible values: 'clear-text', 'progress'.
   * Load more plugins to be able to use more plugins
   */
  reporter?: string | string[];

  /**
   * The log4js loglevel. Possible values: fatal, error, warn, info, debug, trace, all and off. Default is "info"
   */
  logLevel?: string;

  /**
   * Amount of additional time, in milliseconds, the mutation test is allowed to run
   */
  timeoutMs?: number;

  /**
   * The factor is applied on top of the other timeouts when during mutation testing
   */
  timeoutFactor?: number;

  /**
   * A list of plugins. These plugins will be imported ('required') by Stryker upon loading.
   */
  plugins?: string[];

  /**
   * The starting port to used for test frameworks that need to run a server (for example karma).
   * If more test runners will run simultaniously, subsequent port numbers will be used (n+1, n+2, etc.)
   */
  port?: number;
}

export default StrykerOptions;
