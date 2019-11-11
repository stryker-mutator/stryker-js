import * as program from 'commander';
import { getLogger } from 'log4js';

import { CONFIG_SYNTAX_HELP } from './config/ConfigReader';
import { initializerFactory } from './initializer';
import LogConfigurator from './logging/LogConfigurator';
import Stryker from './Stryker';

export default class StrykerCli {
  private command: string = '';
  private strykerConfig: string | null = null;

  constructor(private readonly argv: string[]) {}

  private list(val: string) {
    return val.split(',');
  }

  public run() {
    program
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
        `A comma separated list of globbing expression used for selecting all files needed to run the tests. For a more detailed way of selecting inputfiles, please use a configFile.
      Example: node_modules/a-lib/**/*.js,src/**/*.js,!src/index.js,a.js,test/**/*.js`,
        this.list
      )
      .option(
        '-m, --mutate <filesToMutate>',
        `A comma separated list of globbing expression used for selecting the files that should be mutated.
      Example: src/**/*.js,a.js`,
        this.list
      )
      .option('--coverageAnalysis <perTest|all|off>', 'The coverage analysis strategy you want to use. Default value: "perTest"')
      .option('--testFramework <name>', 'The name of the test framework you want to use.')
      .option('--testRunner <name>', 'The name of the test runner you want to use')
      .option('--mutator <name>', 'The name of the mutant generator you want to use')
      .option('--transpilers <listOfTranspilers>', 'A comma separated list of transpilers to use.', this.list)
      .option('--reporters <name>', 'A comma separated list of the names of the reporter(s) you want to use', this.list)
      .option('--plugins <listOfPlugins>', 'A list of plugins you want stryker to load (`require`).', this.list)
      .option('--timeoutMS <number>', 'Tweak the absolute timeout used to wait for a test runner to complete', parseInt)
      .option('--timeoutFactor <number>', 'Tweak the standard deviation relative to the normal test run of a mutated test', parseFloat)
      .option('--maxConcurrentTestRunners <n>', 'Set the number of max concurrent test runner to spawn (default: cpuCount)', parseInt)
      .option(
        '--logLevel <level>',
        'Set the log level for the console. Possible values: fatal, error, warn, info, debug, trace, all and off. Default is "info"'
      )
      .option(
        '--fileLogLevel <level>',
        'Set the log4js log level for the "stryker.log" file. Possible values: fatal, error, warn, info, debug, trace, all and off. Default is "off"'
      )
      .option('--allowConsoleColors <true/false>', 'Indicates whether or not Stryker should use colors in console.', parseBoolean, true)
      .option(
        '--tempDirName <name>',
        'Set the name of the directory that is used by Stryker as a working directory. This directory will be cleaned after a successful run'
      )
      .parse(this.argv);

    function parseBoolean(val: string) {
      console.log('bool: ', val);
      const v = val.toLocaleLowerCase();
      return v !== 'false' && v !== '0';
    }

    LogConfigurator.configureMainProcess(program.logLevel);
    const log = getLogger(StrykerCli.name);
    // Cleanup commander state
    delete program.options;
    delete program.rawArgs;
    delete program.args;
    delete program.Command;
    delete program.Option;
    delete program.commands;
    for (const i in program) {
      if (i.startsWith('_')) {
        delete program[i];
      }
    }

    if (this.strykerConfig) {
      program.configFile = this.strykerConfig;
    }

    const commands: { [cmd: string]: () => Promise<any> } = {
      init: () => initializerFactory().initialize(),
      run: () => new Stryker(program).runMutationTest()
    };

    if (Object.keys(commands).includes(this.command)) {
      commands[this.command]().catch(err => {
        log.error('an error occurred', err);
        if (!log.isTraceEnabled()) {
          log.info('Trouble figuring out what went wrong? Try `npx stryker run --fileLogLevel trace --logLevel debug` to get some more info.');
        }
        process.exitCode = 1;
        process.kill(process.pid, 'SIGINT');
      });
    } else {
      log.error('Unknown command: "%s", supported commands: [%s], or use `stryker --help`.', this.command, Object.keys(commands));
    }
  }
}
