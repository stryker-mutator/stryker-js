import semver from 'semver';

guardMinimalNodeVersion();

import { Command } from 'commander';
import { MutantResult, DashboardOptions, ALL_REPORT_TYPES, PartialStrykerOptions } from '@stryker-mutator/api/core';

import { initializerFactory } from './initializer/index.js';
import { LogConfigurator } from './logging/index.js';
import { Stryker } from './stryker.js';
import { defaultOptions } from './config/index.js';
import { strykerEngines, strykerVersion } from './stryker-package.js';

/**
 * Interpret a command line argument and add it to an object.
 * @param object The object to assign the value to.
 * @param key The property name under which the value needs to be stored.
 */
function deepOption<T extends string, R>(object: { [K in T]?: R }, key: T) {
  return (value: R) => {
    object[key] = value;
    return undefined;
  };
}

const list = createSplitter(',');

function createSplitter(sep: string) {
  return (val: string) => val.split(sep).filter(Boolean);
}

function parseBoolean(val: string) {
  const v = val.toLocaleLowerCase();
  return v !== 'false' && v !== '0';
}

export class StrykerCli {
  private command = '';
  private strykerConfig: string | null = null;

  constructor(
    private readonly argv: string[],
    private readonly program: Command = new Command(),
    private readonly runMutationTest = async (options: PartialStrykerOptions) => new Stryker(options).runMutationTest()
  ) {}

  public run(): void {
    const dashboard: Partial<DashboardOptions> = {};
    this.program
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      .version(strykerVersion)
      .usage('<command> [options] [configFile]')
      .description(
        `Possible commands:
        run: Run mutation testing
        init: Initialize Stryker for your project

        Optional location to a JSON or JavaScript config file as the last argument. If it's a JavaScript file, that file should export the config directly.`
      )
      .arguments('<command> [configFile]')
      .action((cmd: string, config: string) => {
        this.command = cmd;
        this.strykerConfig = config;
      })
      .option(
        '-f, --files <allFiles>',
        '[DEPRECATED, please use the inverse option `--ignorePatterns` instead] A comma separated list of patterns used for selecting all files needed to run the tests. For a more detailed way of selecting input files, please use a configFile. Example: src/**/*.js,!src/index.js,a.js,test/**/*.js.',
        list
      )
      .option(
        '--ignorePatterns <filesToIgnore>',
        'A comma separated list of patterns used for specifying which files need to be ignored. This should only be used in cases where you experience a slow Stryker startup, because too many (or too large) files are copied to the sandbox that are not needed to run the tests. For example, image or movie directories. Note: This option will have no effect when using the --inPlace option. The directories `node_modules`, `.git` and some others are always ignored. Example: --ignorePatterns dist',
        list
      )
      .option('--ignoreStatic', 'Ignore static mutants. Static mutants are mutants which are only executed during the loading of a file.')
      .option(
        '--incremental',
        "Enable 'incremental mode'. Stryker will store results in a file and use that file to speed up the next --incremental run"
      )
      .option('--incrementalFile <file>', 'Specify the file to use for incremental mode.')
      .option(
        '--force',
        'Run all mutants, even if --incremental is provided and an incremental file exists. Can be used to force a rebuild of the incremental file.'
      )
      .option(
        '-m, --mutate <filesToMutate>',
        'A comma separated list of globbing expression used for selecting the files that should be mutated. Example: src/**/*.js,a.js. You can also specify specific lines and columns to mutate by adding :startLine[:startColumn]-endLine[:endColumn]. This will execute all mutants inside that range. It cannot be combined with glob patterns. Example: src/index.js:1:3-1:5',
        list
      )
      .option(
        '-b, --buildCommand <command>',
        'Configure a build command to run after mutating the code, but before mutants are tested. This is generally used to transpile your code before testing.' +
          " Only configure this if your test runner doesn't take care of this already and you're not using just-in-time transpiler like `babel/register` or `ts-node`."
      )
      .option(
        '--dryRunOnly',
        'Execute the initial test run only, without doing actual mutation testing. Doing a dry run only can be used to test that StrykerJS can run your test setup, for example, in CI pipelines.'
      )
      .option(
        '--checkers <listOfCheckersOrEmptyString>',
        'A comma separated list of checkers to use, for example --checkers typescript',
        createSplitter(',')
      )
      .option('--checkerNodeArgs <listOfNodeArgs>', 'A list of node args to be passed to checker child processes.', createSplitter(' '))
      .option(
        '--coverageAnalysis <perTest|all|off>',
        `The coverage analysis strategy you want to use. Default value: "${defaultOptions.coverageAnalysis}"`
      )
      .option('--testRunner <name>', 'The name of the test runner you want to use')
      .option(
        '--testRunnerNodeArgs <listOfNodeArgs>',
        'A comma separated list of node args to be passed to test runner child processes.',
        createSplitter(' ')
      )
      .option('--reporters <name>', 'A comma separated list of the names of the reporter(s) you want to use', list)
      .option('--plugins <listOfPlugins>', 'A list of plugins you want stryker to load (`require`).', list)
      .option(
        '--appendPlugins <listOfPlugins>',
        'A list of additional plugins you want Stryker to load (`require`) without overwriting the (default) `plugins`.',
        list
      )
      .option('--timeoutMS <number>', 'Tweak the absolute timeout used to wait for a test runner to complete', parseInt)
      .option('--timeoutFactor <number>', 'Tweak the standard deviation relative to the normal test run of a mutated test', parseFloat)
      .option('--dryRunTimeoutMinutes <number>', 'Configure an absolute timeout for the initial test run. (It can take a while.)', parseFloat)
      .option('--maxConcurrentTestRunners <n>', 'Set the number of max concurrent test runner to spawn (default: cpuCount)', parseInt)
      .option(
        '-c, --concurrency <n>',
        'Set the concurrency of workers. Stryker will always run checkers and test runners in parallel by creating worker processes (default: cpuCount - 1)',
        parseInt
      )
      .option('--disableBail', 'Force the test runner to keep running tests, even when a mutant is already killed.')
      .option(
        '--maxTestRunnerReuse <n>',
        'Restart each test runner worker process after `n` runs. Not recommended unless you are experiencing memory leaks that you are unable to resolve. Configuring `0` here means infinite reuse.',
        parseInt
      )
      .option(
        '--logLevel <level>',
        `Set the log level for the console. Possible values: fatal, error, warn, info, debug, trace and off. Default is "${defaultOptions.logLevel}"`
      )
      .option(
        '--fileLogLevel <level>',
        `Set the log4js log level for the "stryker.log" file. Possible values: fatal, error, warn, info, debug, trace and off. Default is "${defaultOptions.fileLogLevel}"`
      )
      .option('--allowConsoleColors <true/false>', 'Indicates whether or not Stryker should use colors in console.', parseBoolean)
      .option(
        '--dashboard.project <name>',
        'Indicates which project name to use if the "dashboard" reporter is enabled. Defaults to the git url configured in the environment of your CI server.',
        deepOption(dashboard, 'project')
      )
      .option(
        '--dashboard.version <version>',
        'Indicates which version to use if the "dashboard" reporter is enabled. Defaults to the branch name or tag name configured in the environment of your CI server.',
        deepOption(dashboard, 'version')
      )
      .option(
        '--dashboard.module <name>',
        'Indicates which module name to use if the "dashboard" reporter is enabled.',
        deepOption(dashboard, 'module')
      )
      .option(
        '--dashboard.baseUrl <url>',
        `Indicates which baseUrl to use when reporting to the stryker dashboard. Default: "${defaultOptions.dashboard.baseUrl}"`,
        deepOption(dashboard, 'baseUrl')
      )
      .option(
        `--dashboard.reportType <${ALL_REPORT_TYPES.join('|')}>`,
        `Send a full report (inc. source code and mutant results) or only the mutation score. Default: ${defaultOptions.dashboard.reportType}`,
        deepOption(dashboard, 'reportType')
      )
      .option(
        '--inPlace',
        'Enable Stryker to mutate your files in place and put back the originals after its done. Note: mutating your files in place is generally not needed for mutation testing.'
      )
      .option(
        '--tempDirName <name>',
        'Set the name of the directory that is used by Stryker as a working directory. This directory will be cleaned after a successful run'
      )
      .option(
        '--cleanTempDir <true/false>',
        `Choose whether or not to clean the temp dir (which is "${defaultOptions.tempDirName}" inside the current working directory by default) after a successful run. The temp dir will never be removed when the run failed for some reason (for debugging purposes).`,
        parseBoolean
      )
      .showSuggestionAfterError()
      .parse(this.argv);

    // Earliest opportunity to configure the log level based on the logLevel argument
    const options: PartialStrykerOptions = this.program.opts();
    LogConfigurator.configureMainProcess(options.logLevel);

    // Cleanup commander state
    delete options.version;
    Object.keys(options)
      .filter((key) => key.startsWith('dashboard.'))
      .forEach((key) => delete options[key]);

    if (this.strykerConfig) {
      options.configFile = this.strykerConfig;
    }
    if (Object.keys(dashboard).length > 0) {
      options.dashboard = dashboard;
    }

    const commands = {
      init: () => initializerFactory().initialize(),
      run: () => this.runMutationTest(options),
    };

    if (Object.keys(commands).includes(this.command)) {
      const promise: Promise<MutantResult[] | void> = commands[this.command as keyof typeof commands]();
      promise.catch(() => {
        process.exitCode = 1;
      });
    } else {
      console.error('Unknown command: "%s", supported commands: [%s], or use `stryker --help`.', this.command, Object.keys(commands));
    }
  }
}

export function guardMinimalNodeVersion(processVersion = process.version): void {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  if (!semver.satisfies(processVersion, strykerEngines.node)) {
    throw new Error(
      `Node.js version ${processVersion} detected. StrykerJS requires version to match ${strykerEngines.node}. Please update your Node.js version or visit https://nodejs.org/ for additional instructions`
    );
  }
}
