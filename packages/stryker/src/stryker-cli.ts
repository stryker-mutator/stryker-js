import * as program from 'commander';
import { CONFIG_SYNTAX_HELP } from './ConfigReader';
import Stryker from './Stryker';
import StrykerInitializer from './initializer/StrykerInitializer';
import * as log4js from 'log4js';

const log = log4js.getLogger('stryker-cli');
let command: string = '', strykerConfig: string | null = null;

function list(val: string) {
  return val.split(',');
}
program
  .version(require('../package.json').version)
  .usage('<command> [options] [stryker.conf.js]')
  .description(`Possible commands: 
    run: Run mutation testing
    init: Initalize Stryker for your project

Optional location to the stryker.conf.js file as last argument. That file should export a function which accepts a "config" object\n${CONFIG_SYNTAX_HELP}`)
  .arguments('<command> [stryker.conf.js]')
  .action((cmd: string, config: string) => {
    command = cmd;
    strykerConfig = config;
  })
  .option('-f, --files <allFiles>', `A comma seperated list of globbing expression used for selecting all files needed to run the tests. For a more detailed way of selecting inputfiles, please use a configFile.
  Example: node_modules/a-lib/**/*.js,src/**/*.js,!src/index.js,a.js,test/**/*.js`, list)
  .option('-m, --mutate <filesToMutate>', `A comma seperated list of globbing expression used for selecting the files that should be mutated.
  Example: src/**/*.js,a.js`, list)
  .option('--coverageAnalysis <perTest|all|off>', `The coverage analysis strategy you want to use. Default value: "perTest"`)
  .option('--testFramework <name>', `The name of the test framework you want to use.`)
  .option('--testRunner <name>', `The name of the test runner you want to use`)
  .option('--reporter <name>', 'A comma separated list of the names of the reporter(s) you want to use', list)
  .option('--plugins <listOfPlugins>', 'A list of plugins you want stryker to load (`require`).', list)
  .option('--port <n>', 'A free port for the test runner to use (if it needs to). Any additional test runners will be spawned using n+1, n+2, etc', parseInt)
  .option('--timeoutMs <number>', 'Tweak the absolute timeout used to wait for a test runner to complete', parseInt)
  .option('--timeoutFactor <number>', 'Tweak the standard deviation relative to the normal test run of a mutated test', parseFloat)
  .option('--maxConcurrentTestRunners <n>', 'Set the number of max concurrent test runner to spawn (default: cpuCount)', parseInt)
  .option('--logLevel <level>', 'Set the log4js loglevel. Possible values: fatal, error, warn, info, debug, trace, all and off. Default is "info"')
  .parse(process.argv);

log4js.setGlobalLogLevel(program['logLevel'] || 'info');

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

if (strykerConfig) {
  program['configFile'] = strykerConfig;
}

if (program['logLevel']) {
  log4js.setGlobalLogLevel(program['logLevel']);
}

const commands: { [cmd: string]: () => Promise<any> } = {
  init: () => new StrykerInitializer().initialize(),
  run: () => new Stryker(program).runMutationTest()
};

if (Object.keys(commands).indexOf(command) >= 0) {
  commands[command]().catch(err => {
    log.error(`an error occurred`, err);
    process.exitCode = 1;
    process.kill(process.pid, 'SIGINT');
  });
} else {
  log.error('Unknown command: "%s", supported commands: [%s], or use `stryker --help`.', command, Object.keys(commands));
}
