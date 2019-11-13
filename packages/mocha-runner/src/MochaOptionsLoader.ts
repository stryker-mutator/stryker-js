import * as fs from 'fs';
import * as path from 'path';

import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';

import LibWrapper from './LibWrapper';
import { MochaOptions } from './MochaOptions';
import { filterConfig, mochaOptionsKey, serializeArguments } from './utils';

/**
 * Subset of defaults for mocha options
 * @see https://github.com/mochajs/mocha/blob/master/lib/mocharc.json
 */
export const DEFAULT_MOCHA_OPTIONS = Object.freeze({
  extension: ['js'],
  file: [],
  ignore: [],
  opts: './test/mocha.opts',
  spec: ['test'],
  timeout: 2000,
  ui: 'bdd'
});

export default class MochaOptionsLoader {
  public static inject = tokens(commonTokens.logger);
  constructor(private readonly log: Logger) {}

  public load(strykerOptions: StrykerOptions): MochaOptions {
    const mochaOptions = { ...strykerOptions[mochaOptionsKey] } as MochaOptions;
    return { ...DEFAULT_MOCHA_OPTIONS, ...this.loadMochaOptions(mochaOptions), ...mochaOptions };
  }

  private loadMochaOptions(overrides: MochaOptions) {
    if (LibWrapper.loadOptions) {
      this.log.debug("Mocha >= 6 detected. Using mocha's `%s` to load mocha options", LibWrapper.loadOptions.name);
      return this.loadMocha6Options(overrides);
    } else {
      this.log.warn('DEPRECATED: Mocha < 6 detected. Please upgrade to at least Mocha version 6.');
      this.log.debug('Mocha < 6 detected. Using custom logic to parse mocha options');
      return this.loadLegacyMochaOptsFile(overrides.opts);
    }
  }

  private loadMocha6Options(overrides: MochaOptions) {
    const args = serializeArguments(overrides);
    const loadOptions = LibWrapper.loadOptions || (() => ({}));
    const rawConfig = loadOptions(args) || {};
    if (this.log.isTraceEnabled()) {
      this.log.trace(`Mocha: ${loadOptions.name}([${args.map(arg => `'${arg}'`).join(',')}]) => ${JSON.stringify(rawConfig)}`);
    }
    const options = filterConfig(rawConfig);
    if (this.log.isDebugEnabled()) {
      this.log.debug(`Loaded options: ${JSON.stringify(options, null, 2)}`);
    }
    return options;
  }

  private loadLegacyMochaOptsFile(opts: false | string | undefined): MochaOptions {
    switch (typeof opts) {
      case 'boolean':
        this.log.debug('Not reading additional mochaOpts from a file');
        return {};
      case 'undefined':
        const defaultMochaOptsFileName = path.resolve(DEFAULT_MOCHA_OPTIONS.opts);
        if (fs.existsSync(defaultMochaOptsFileName)) {
          return this.readMochaOptsFile(defaultMochaOptsFileName);
        } else {
          this.log.debug('No mocha opts file found, not loading additional mocha options (%s.opts was not defined).', mochaOptionsKey);
          return {};
        }
      case 'string':
        const optsFileName = path.resolve(opts);
        if (fs.existsSync(optsFileName)) {
          return this.readMochaOptsFile(optsFileName);
        } else {
          this.log.error(`Could not load opts from "${optsFileName}". Please make sure opts file exists.`);
          return {};
        }
    }
  }

  private readMochaOptsFile(optsFileName: string) {
    this.log.info(`Loading mochaOpts from "${optsFileName}"`);
    return this.parseOptsFile(fs.readFileSync(optsFileName, 'utf8'));
  }

  private parseOptsFile(optsFileContent: string): MochaOptions {
    const options = optsFileContent.split('\n').map(val => val.trim());
    const mochaRunnerOptions: MochaOptions = Object.create(null);
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
