import * as path from 'path';
import * as fs from 'fs';
import { StrykerOptions } from 'stryker-api/core';
import MochaRunnerOptions, { mochaOptionsKey } from './MochaRunnerOptions';
import { tokens, commonTokens } from 'stryker-api/plugin';
import { Logger } from 'stryker-api/logging';

export default class MochaOptionsLoader {

  private readonly DEFAULT_MOCHA_OPTS = 'test/mocha.opts';

  public static inject = tokens(commonTokens.logger);
  constructor(private readonly log: Logger) { }

  public load(config: StrykerOptions): MochaRunnerOptions {
    const mochaOptions = Object.assign({}, config[mochaOptionsKey]) as MochaRunnerOptions;
    let optsFileName = path.resolve(this.DEFAULT_MOCHA_OPTS);

    if (mochaOptions.opts) {
      optsFileName = path.resolve(mochaOptions.opts);
    }

    if (fs.existsSync(optsFileName)) {
      this.log.info(`Loading mochaOpts from "${optsFileName}"`);
      const options = fs.readFileSync(optsFileName, 'utf8');
      return Object.assign(this.parseOptsFile(options), mochaOptions);
    } else if (mochaOptions.opts) {
      this.log.error(`Could not load opts from "${optsFileName}". Please make sure opts file exists.`);
    } else {
      this.log.debug('No mocha opts file found, not loading additional mocha options (%s.opts was not defined).', mochaOptionsKey);
    }
    return mochaOptions;
  }

  private parseOptsFile(optsFileContent: string): MochaRunnerOptions {
    const options = optsFileContent.split('\n').map(val => val.trim());
    const mochaRunnerOptions: MochaRunnerOptions = Object.create(null);
    options.forEach(option => {
      const args = option.split(' ').filter(Boolean);
      if (args[0]) {
        switch (args[0]) {
          case '--require':
          case '-r':
            args.shift();
            if (!mochaRunnerOptions.require) {
              mochaRunnerOptions.require = [];
            }
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
          case '--grep':
          case '-g':
            let arg = `${this.parseNextString(args)}`;
            if (arg.startsWith('/') && arg.endsWith('/')) {
              arg = arg.substring(1, arg.length - 1);
            }
            mochaRunnerOptions.grep = new RegExp(arg);
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
      return parseInt(args[1], 10);
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
