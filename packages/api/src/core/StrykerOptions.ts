import LogLevel from './LogLevel';
import MutationScoreThresholds from './MutationScoreThresholds';
import MutatorDescriptor from './MutatorDescriptor';

interface StrykerOptions {
  // this ensures that plugins can load custom config.
  [customConfig: string]: any;

  /**
   * A list of globbing expression used for selecting the files that should be mutated.
   */
  mutate: string[];

  /**
   * With `files` you can choose which files should be included in your test runner sandbox.
   * This is normally not needed as it defaults to all files not ignored by git.
   * Try it out yourself with this command: `git ls-files --others --exclude-standard --cached --exclude .stryker-tmp`.
   *
   * If you do need to override `files` (for example: when your project does not live in a git repository),
   * you can override the files here.
   *
   * When using the command line, the list can only contain a comma separated list of globbing expressions.
   * When using the config file you can provide an array with `string`s
   *
   * You can *ignore* files by adding an exclamation mark (`!`) at the start of an expression.
   *
   */
  files?: string[];

  /**
   * Specify the maximum number of concurrent test runners. Useful if you don't want to use
   * all the CPU cores of your machine. Default: infinity, Stryker will decide for you and tries to use
   * all CPUs in your machine optimally.
   */
  maxConcurrentTestRunners: number;

  /**
   * A location to a config file. That file should export a function which accepts a "config" object which it uses to configure stryker
   */
  configFile?: string;

  /**
   * The name of the test framework to use
   */
  testFramework?: string;

  /**
   * The name of the test runner to use (default is 'command')
   */
  testRunner: string;

  /**
   * The mutant generator to use to generate mutants based on your input file.
   * This is often dependent on the language of your source files.
   *
   * This value can be either a string, or an object with 2 properties:
   * * `string`: The name of the mutant generator to use. For example: 'javascript', 'typescript'
   * * { name: 'name', excludedMutations: ['mutationType1', 'mutationType2'] }:
   *    * The `name` property is mandatory and contains the name of the mutant generator to use.
   *    * For example: 'javascript', 'typescript'
   *    * The `excludedMutations` property is mandatory and contains the names of the specific mutation types to exclude from testing.
   *    * The values must match the given names of the mutations. For example: 'BinaryExpression', 'BooleanSubstitution', etc.
   */
  mutator: string | MutatorDescriptor;

  /**
   * The names of the transpilers to use (in order). Default: [].
   * A transpiler in this context is a plugin that can transform input files (source code)
   * before testing.
   *
   * Example use cases:
   * * You need to transpile typescript before testing it in nodejs
   * * You want to bundle nodejs code before testing it in the browser.
   *
   * The order of your defined transpilers is important, as each transpiler
   * will be fead the output files of the previous transpiler. For example:
   *
   * foo.ts   ==> Typescript  ==> foo.js ==> Webpack ==> foobar.js
   * bar.ts   ==> Transpiler  ==> bar.js ==> Transpiler
   *
   * Transpilers should ignore files marked with `transpiled = false`. See `files` array.
   */
  transpilers: string[];

  /**
   * Thresholds for mutation score.
   */
  thresholds: MutationScoreThresholds;

  /**
   * Indicates which coverage analysis strategy to use.
   * During mutation testing, stryker will try to only run the tests that cover a particular line of code.
   *
   * 'perTest' (default): Analyse coverage per test.
   * 'all': Analyse the coverage for the entire test suite.
   * 'off': Don't use coverage analysis
   */
  coverageAnalysis: 'perTest' | 'all' | 'off';

  /**
   * The names of the reporters to use
   * Possible values: 'clear-text', 'progress'.
   * Load more plugins to be able to use more reporters
   */
  reporters: string[];

  /**
   * The log level for logging to a file. If defined, stryker will output a log file called "stryker.log".
   * Default: "off"
   */
  fileLogLevel: LogLevel;

  /**
   * The log level for logging to the console. Default: "info".
   */
  logLevel: LogLevel;

  /**
   * Indicates whether or not to symlink the node_modules folder inside the sandbox folder(s).
   * Default: true
   */
  symlinkNodeModules: boolean;
  /**
   * Amount of additional time, in milliseconds, the mutation test is allowed to run
   */
  timeoutMS: number;

  /**
   * The factor is applied on top of the other timeouts when during mutation testing
   */
  timeoutFactor: number;

  /**
   * A list of plugins. These plugins will be imported ('required') by Stryker upon loading.
   */
  plugins: string[];

  /**
   * Indicates whether or not to use colors in console.
   * Default: true
   */
  allowConsoleColors: boolean;

  /**
   * The name of the dir name. Default: `.stryker-tmp`
   */
  tempDirName: string;
}

export default StrykerOptions;
