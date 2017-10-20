import * as path from 'path';
import * as fs from 'fs';
import { ConfigEditor, Config } from 'stryker-api/config';
import { getLogger } from 'log4js';
import MochaRunnerOptions, { mochaOptionsKey } from './MochaRunnerOptions';


export default class MochaConfigEditor implements ConfigEditor {

  private log = getLogger('MochaTestRunner');

  edit(config: Config): void {
    const mochaOptions = config[mochaOptionsKey];
    if (mochaOptions && mochaOptions.opts) {
      const optsFileName = path.resolve(mochaOptions.opts);
      this.log.info(`Loading mochaOpts from "${optsFileName}"`);
      const options = fs.readFileSync(optsFileName, 'utf8');
      const runnerOptions = Object.assign(this.parseOptsFile(options), config[mochaOptionsKey]);
      config[mochaOptionsKey] = runnerOptions;
    }
  }

  private parseOptsFile(optsFileContent: string): MochaRunnerOptions {
    const options = optsFileContent.split('\n').map(val => val.trim());
    const mochaRunnerOptions: MochaRunnerOptions = {
      require: []
    };
    options.forEach(option => {
      const args = option.split(' ').filter(Boolean);
      if (args[0]) {
        switch (args[0]) {
          case '--require':
          case '-r':
            args.shift();
            mochaRunnerOptions.require.push(...args);
            break;
          case '--timeout':
          case '-t':
            mochaRunnerOptions.timeout = this.parseNextInt(args);
            break;
          case '--async-only':
          case '-A':
            mochaRunnerOptions.asyncOnly = true;
            break;
          case '--ui':
          case '-u':
            mochaRunnerOptions.ui = this.parseNextString(args);
            break;
          default:
            this.log.debug(`Ignoring option "${args[0]}" as it is not supported.`);
            break;
        }
      }
    });
    return mochaRunnerOptions;
  }

  private parseNextInt(args: string[]): number | undefined {
    if (args.length > 1) {
      return Number.parseInt(args[1]);
    } else {
      return undefined;
    }
  }

  private parseNextString(args: string[]): string | undefined {
    if (args.length > 1) {
      return args[1];
    } else {
      return undefined;
    }
  }
}