import * as commander from 'commander';
import { DashboardOptions, ALL_REPORT_TYPES, PartialStrykerOptions } from '@stryker-mutator/api/core';

import { MutantResult } from '@stryker-mutator/api/report';

import { initializerFactory } from './initializer';
import { LogConfigurator } from './logging';
import Stryker from './Stryker';
import { defaultOptions } from './config/OptionsValidator';

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

function list(val: string) {
  return val.split(',');
}

function parseBoolean(val: string) {
  const v = val.toLocaleLowerCase();
  return v !== 'false' && v !== '0';
}

export default class StrykerCli {
  private command: string = '';
  private strykerConfig: string | null = null;

  constructor(
    private readonly argv: string[],
    private readonly program: commander.Command = new commander.Command(),
    private readonly runMutationTest = async (options: PartialStrykerOptions) => new Stryker(options).runMutationTest()
  ) {}

  public run() {
    const dashboard: Partial<DashboardOptions> = {};
    const defaultValues = defaultOptions();
    this.program
      .version(require('../package.json').version)
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
        `A comma separated list of globbing expression used for selecting all files needed to run the tests. For a more detailed way of selecting input files, please use a configFile.
      Example: node_modules/a-lib/**/*.js,src/**/*.js,!src/index.js,a.js,test/**/*.js`,
        list
      )
      .option(
        '-m, --mutate <filesToMutate>',
        `A comma separated list of globbing expression used for selecting the files that should be mutated.
      Example: src/**/*.js,a.js`,
        list
      )
      .option(
        '--coverageAnalysis <perTest|all|off>',
        `The coverage analysis strategy you want to use. Default value: "${defaultValues.coverageAnalysis}"`
      )
      .option('--testFramework <name>', 'The name of the test framework you want to use.')
      .option('--testRunner <name>', 'The name of the test runner you want to use')
      .option('--mutator <name>', 'The name of the mutant generator you want to use')
      .option('--transpilers <listOfTranspilers>', 'A comma separated list of transpilers to use.', list)
      .option('--reporters <name>', 'A comma separated list of the names of the reporter(s) you want to use', list)
      .option('--plugins <listOfPlugins>', 'A list of plugins you want stryker to load (`require`).', list)
      .option('--timeoutMS <number>', 'Tweak the absolute timeout used to wait for a test runner to complete', parseInt)
      .option('--timeoutFactor <number>', 'Tweak the standard deviation relative to the normal test run of a mutated test', parseFloat)
      .option('--maxConcurrentTestRunners <n>', 'Set the number of max concurrent test runner to spawn (default: cpuCount)', parseInt)
      .option(
        '-c, --concurrency <n>',
        'Set the concurrency of workers. Stryker will always run checkers and test runners in parallel by creating worker processes (default: cpuCount - 1)',
        parseInt
      )
      .option(
        '--logLevel <level>',
        `Set the log level for the console. Possible values: fatal, error, warn, info, debug, trace, all and off. Default is "${defaultValues.logLevel}"`
      )
      .option(
        '--fileLogLevel <level>',
        `Set the log4js log level for the "stryker.log" file. Possible values: fatal, error, warn, info, debug, trace, all and off. Default is "${defaultValues.fileLogLevel}"`
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
        `Indicates which baseUrl to use when reporting to the stryker dashboard. Default: "${defaultValues.dashboard.baseUrl}"`,
        deepOption(dashboard, 'baseUrl')
      )
      .option(
        `--dashboard.reportType <${ALL_REPORT_TYPES.join('|')}>`,
        `Send a full report (inc. source code and mutant results) or only the mutation score. Default: ${defaultValues.dashboard.reportType}`,
        deepOption(dashboard, 'reportType')
      )
      .option(
        '--tempDirName <name>',
        'Set the name of the directory that is used by Stryker as a working directory. This directory will be cleaned after a successful run'
      )
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
      const promise: Promise<void | MutantResult[]> = commands[this.command as keyof typeof commands]();
      promise.catch((err) => {
        process.exitCode = 1;
      });
    } else {
      console.error('Unknown command: "%s", supported commands: [%s], or use `stryker --help`.', this.command, Object.keys(commands));
    }
  }
}
