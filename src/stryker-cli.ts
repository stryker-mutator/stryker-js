var program = require('commander');
import {CONFIG_SYNTAX_HELP} from './ConfigReader';
import Stryker from './Stryker';
import * as log4js from 'log4js';

const log = log4js.getLogger('stryker-cli');

function list(val: string) {
  return val.split(',');
}
program
  .usage('-f <files> -m <filesToMutate> -c <configFileLocation> [other options]')
  .description('Starts the stryker mutation testing process. Required arguments are --mutate, --files, --testFramework and --testRunner. You can use globbing expressions to target multiple files. See https://github.com/isaacs/node-glob#glob-primer for more information about the globbing syntax.')
  .option('-m, --mutate <filesToMutate>', `A comma seperated list of globbing expression used for selecting the files that should be mutated.
                              Example: src/**/*.js,a.js`, list)
  .option('-f, --files <allFiles>', `A comma seperated list of globbing expression used for selecting all files needed to run the tests. These include library files, test files and files to mutate, but should NOT include test framework files (for example jasmine). For a more detailed way of selecting inputfiles, please use a configFile.
                              Example: node_modules/a-lib/**/*.js,src/**/*.js,a.js,test/**/*.js`, list)
  .option('--testFramework <name>', `The name of the test framework you want to use`)
  .option('--testRunner <name>', `The name of the test runner you want to use`)
  .option('--testSelector <name>', `The name of the test selector you want to use`)
  .option('--reporter <name>', 'The name of the reporter you want to use', list)
  .option('--port <n>', 'A free port for the test runner to use (if it needs to). Any additional test runners will be spawned using n+1, n+2, etc', parseInt)
  .option('--timeoutMs <number>', 'Tweak the absolute timeout used to wait for a test runner to complete', parseInt)
  .option('--timeoutFactor <number>', 'Tweak the standard deviation relative to the normal test run of a mutated test', parseFloat)
  .option('--plugins <listOfPlugins>', 'A list of plugins you want stryker to load (`require`).', list)
  .option('-c, --configFile <configFileLocation>', 'A location to a config file. That file should export a function which accepts a "config" object\n' +
  CONFIG_SYNTAX_HELP)
  .option('--logLevel <level>', 'Set the log4js loglevel. Possible values: fatal, error, warn, info, debug, trace, all and off. Default is "info"')
  .parse(process.argv);

log4js.setGlobalLogLevel(program['logLevel'] || 'info')

// Cleanup commander state
delete program.options;
delete program.rawArgs;
delete program.args;
delete program.commands;
for (let i in program) {
  if (i.charAt(0) === '_') {
    delete program[i];
  }
}

new Stryker(program).runMutationTest()
  .catch(err => log.error(`an error occurred`, err));
