import { Command } from 'commander';
import { getLogger } from 'log4js';
import { DashboardOptions, StrykerOptions, ALL_REPORT_TYPES } from '@stryker-mutator/api/core';
import { Config } from '@stryker-mutator/api/config';
import { Logger } from '@stryker-mutator/api/logging';

import { initializerFactory } from './initializer';
import LogConfigurator from './logging/LogConfigurator';
import Stryker from './Stryker';
import { Statistics } from './statistics/Statistics';
import ConfigReader, { CONFIG_SYNTAX_HELP } from './config/ConfigReader';
import { readConfig } from './config';

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
    private readonly program: Command = new Command(),
    private readonly runMutationTest = (options: Partial<StrykerOptions>) => new Stryker(options).runMutationTest(),
    private readonly log: Logger = getLogger(StrykerCli.name)
  ) {}

  public run() {
    const dashboard: Partial<DashboardOptions> = {};
    const defaultValues = new Config();
    this.program
      .version(require('../package.json').version)
      .usage('<command> [options] [stryker.conf.js]')
      .description(
        `Possible commands:
        run: Run mutation testing
        init: Initialize Stryker for your project

    Optional location to the stryker.conf.js file as last argument. That file should export a function which accepts a "config" object\n${CONFIG_SYNTAX_HELP}`
      )
      .arguments('<command> [stryker.conf.js]')
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
        '--logLevel <level>',
        `Set the log level for the console. Possible values: fatal, error, warn, info, debug, trace, all and off. Default is "${defaultValues.logLevel}"`
      )
      .option(
        '--fileLogLevel <level>',
        `Set the log4js log level for the "stryker.log" file. Possible values: fatal, error, warn, info, debug, trace, all and off. Default is "${defaultValues.fileLogLevel}"`
      )
      .option('--allowConsoleColors <true/false>', 'Indicates whether or not Stryker should use colors in console.', parseBoolean, true)
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
    LogConfigurator.configureMainProcess(this.program.logLevel);

    // Cleanup commander state
    delete this.program.options;
    delete this.program.rawArgs;
    delete this.program.args;
    delete this.program.Command;
    delete this.program.Option;
    delete this.program.commands;
    for (const i in this.program) {
      if (i.startsWith('_') || i.startsWith('dashboard.')) {
        delete this.program[i];
      }
    }

    if (this.strykerConfig) {
      this.program.configFile = this.strykerConfig;
    }
    this.program.dashboard = dashboard;

    const commands: { [cmd: string]: () => Promise<any> } = {
      init: () => initializerFactory().initialize(),
      run: () => this.runMutationTest(this.program)
    };

    if (Object.keys(commands).includes(this.command)) {
      commands[this.command]().catch(async err => {
        this.log.error('an error occurred', err);

        try {
          let config = readConfig(new ConfigReader(this.program, this.log));
          if (config.collectStatistics === 'yes') {
            await this.reportError(err, config);
          }
        } catch {
          this.log.warn("Did not send error statistics, either it's not permitted or an error occurred.");
        }

        if (!this.log.isTraceEnabled()) {
          this.log.info('Trouble figuring out what went wrong? Try `npx stryker run --fileLogLevel trace --logLevel debug` to get some more info.');
        }
        process.exitCode = 1;
        process.kill(process.pid, 'SIGINT');
      });
    } else {
      this.log.error('Unknown command: "%s", supported commands: [%s], or use `stryker --help`.', this.command, Object.keys(commands));
    }
  }

  private async reportError(err: Error, config: Config) {
    const statisticsProcess = new Statistics(this.log);
    statisticsProcess.setStatistic('testRunner', config.testRunner);
    statisticsProcess.setStatistic('errorType', err.name);
    statisticsProcess.setStatistic('errorMessage', err.message);
    await statisticsProcess.sendStatistics();
  }
}
