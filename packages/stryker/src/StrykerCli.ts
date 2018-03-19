import * as program from 'commander';
import { CONFIG_SYNTAX_HELP } from './ConfigReader';
import Stryker from './Stryker';
import StrykerInitializer from './initializer/StrykerInitializer';
import { getLogger, setGlobalLogLevel } from 'log4js';


export default class StrykerCli {

  private readonly log = getLogger(StrykerCli.name);
  private command: string = '';
  private strykerConfig: string | null = null;

  constructor(private argv: string[]) { }

  private list(val: string) {
    return val.split(',');
  }

  public run() {
    program
      .version(require('../package.json').version)
      .usage('<command> [options] [stryker.conf.js]')
      .description(`Possible commands:
        run: Run mutation testing
        init: Initalize Stryker for your project

    Optional location to the stryker.conf.js file as last argument. That file should export a function which accepts a "config" object\n${CONFIG_SYNTAX_HELP}`)
      .arguments('<command> [stryker.conf.js]')
      .action((cmd: string, config: string) => {
        this.command = cmd;
        this.strykerConfig = config;
      })
      .option('-f, --files <allFiles>', `A comma separated list of globbing expression used for selecting all files needed to run the tests. For a more detailed way of selecting inputfiles, please use a configFile.
      Example: node_modules/a-lib/**/*.js,src/**/*.js,!src/index.js,a.js,test/**/*.js`, this.list)
      .option('-m, --mutate <filesToMutate>', `A comma separated list of globbing expression used for selecting the files that should be mutated.
      Example: src/**/*.js,a.js`, this.list)
      .option('--coverageAnalysis <perTest|all|off>', `The coverage analysis strategy you want to use. Default value: "perTest"`)
      .option('--testFramework <name>', `The name of the test framework you want to use.`)
      .option('--testRunner <name>', `The name of the test runner you want to use`)
      .option('--mutator <name>', `The name of the mutant generator you want to use`)
      .option('--transpilers <listOfTranspilers>', 'A comma separated list of transpilers to use.', this.list)
      .option('--reporter <name>', 'A comma separated list of the names of the reporter(s) you want to use', this.list)
      .option('--plugins <listOfPlugins>', 'A list of plugins you want stryker to load (`require`).', this.list)
      .option('--port <n>', 'A free port for the test runner to use (if it needs to). Any additional test runners will be spawned using n+1, n+2, etc', parseInt)
      .option('--timeoutMs <number>', 'Tweak the absolute timeout used to wait for a test runner to complete', parseInt)
      .option('--timeoutFactor <number>', 'Tweak the standard deviation relative to the normal test run of a mutated test', parseFloat)
      .option('--maxConcurrentTestRunners <n>', 'Set the number of max concurrent test runner to spawn (default: cpuCount)', parseInt)
      .option('--logLevel <level>', 'Set the log4js log level. Possible values: fatal, error, warn, info, debug, trace, all and off. Default is "info"')
      .parse(this.argv);

    setGlobalLogLevel(program['logLevel'] || 'info');

    // Cleanup commander state
    delete program['options'];
    delete program['rawArgs'];
    delete program.args;
    delete program.Command;
    delete program.Option;
    delete program['commands'];
    for (let i in program) {
      if (i.charAt(0) === '_') {
        delete program[i];
      }
    }

    if (this.strykerConfig) {
      program['configFile'] = this.strykerConfig;
    }

    if (program['logLevel']) {
      setGlobalLogLevel(program['logLevel']);
    }

    const commands: { [cmd: string]: () => Promise<any> } = {
      init: () => new StrykerInitializer().initialize(),
      run: () => new Stryker(program).runMutationTest()
    };

    if (Object.keys(commands).indexOf(this.command) >= 0) {
      commands[this.command]().catch(err => {
        this.log.error(`an error occurred`, err);
        process.exitCode = 1;
        process.kill(process.pid, 'SIGINT');
      });
    } else {
      this.log.error('Unknown command: "%s", supported commands: [%s], or use `stryker --help`.', this.command, Object.keys(commands));
    }
  }
}
