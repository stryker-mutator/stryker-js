import fs from 'fs';
import path from 'path';

import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { propertyPath } from '@stryker-mutator/util';

import { MochaOptions, MochaRunnerOptions } from '../src-generated/mocha-runner-options.js';

import { LibWrapper } from './lib-wrapper.js';
import { filterConfig, serializeMochaLoadOptionsArguments } from './utils.js';
import { MochaRunnerWithStrykerOptions } from './mocha-runner-with-stryker-options.js';

/**
 * Subset of defaults for mocha options
 * @see https://github.com/mochajs/mocha/blob/master/lib/mocharc.json
 */
export const DEFAULT_MOCHA_OPTIONS: Readonly<MochaOptions> = Object.freeze({
  extension: ['js'],
  require: [],
  file: [],
  ignore: [],
  opts: './test/mocha.opts',
  spec: ['test'],
  ui: 'bdd',
  'no-package': false,
  'no-opts': false,
  'no-config': false,
  'async-only': false,
});

export class MochaOptionsLoader {
  public static inject = tokens(commonTokens.logger);
  constructor(private readonly log: Logger) {}

  public load(strykerOptions: MochaRunnerWithStrykerOptions): MochaOptions {
    const mochaOptions = { ...strykerOptions.mochaOptions } as MochaOptions;
    const options = { ...DEFAULT_MOCHA_OPTIONS, ...this.loadMochaOptions(mochaOptions), ...mochaOptions };
    if (this.log.isDebugEnabled()) {
      this.log.debug(`Loaded options: ${JSON.stringify(options, null, 2)}`);
    }
    return options;
  }

  private loadMochaOptions(overrides: MochaOptions) {
    if (LibWrapper.loadOptions) {
      this.log.debug("Mocha >= 6 detected. Using mocha's `%s` to load mocha options", LibWrapper.loadOptions.name);
      return this.loadMocha6Options(overrides);
    } else {
      this.log.warn('DEPRECATED: Mocha < 6 detected. Please upgrade to at least Mocha version 6. Stryker will drop support for Mocha < 6 in V5.');
      this.log.debug('Mocha < 6 detected. Using custom logic to parse mocha options');
      return this.loadLegacyMochaOptsFile(overrides);
    }
  }

  private loadMocha6Options(overrides: MochaOptions) {
    const args = serializeMochaLoadOptionsArguments(overrides);
    const rawConfig = LibWrapper.loadOptions(args) ?? {};
    if (this.log.isTraceEnabled()) {
      this.log.trace(`Mocha: ${LibWrapper.loadOptions.name}([${args.map((arg) => `'${arg}'`).join(',')}]) => ${JSON.stringify(rawConfig)}`);
    }
    const options = filterConfig(rawConfig);
    return options;
  }

  private loadLegacyMochaOptsFile(options: MochaOptions): Partial<MochaOptions> {
    if (options['no-opts']) {
      this.log.debug('Not reading additional mochaOpts from a file');
      return options;
    }
    switch (typeof options.opts) {
      case 'undefined': {
        const defaultMochaOptsFileName = path.resolve(DEFAULT_MOCHA_OPTIONS.opts!);
        if (fs.existsSync(defaultMochaOptsFileName)) {
          return this.readMochaOptsFile(defaultMochaOptsFileName);
        } else {
          this.log.debug(
            'No mocha opts file found, not loading additional mocha options (%s was not defined).',
            propertyPath<MochaRunnerOptions>()('mochaOptions', 'opts'),
          );
          return {};
        }
      }
      case 'string': {
        const optsFileName = path.resolve(options.opts);
        if (fs.existsSync(optsFileName)) {
          return this.readMochaOptsFile(optsFileName);
        } else {
          this.log.error(`Could not load opts from "${optsFileName}". Please make sure opts file exists.`);
          return {};
        }
      }
      default:
        return {};
    }
  }

  private readMochaOptsFile(optsFileName: string) {
    this.log.info(`Loading mochaOpts from "${optsFileName}"`);
    return this.parseOptsFile(fs.readFileSync(optsFileName, 'utf8'));
  }

  private parseOptsFile(optsFileContent: string): MochaOptions {
    const options = optsFileContent.split('\n').map((val) => val.trim());
    const mochaRunnerOptions: MochaOptions = Object.create(null);
    options.forEach((option) => {
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
          case '--async-only':
          case '-A':
            mochaRunnerOptions['async-only'] = true;
            break;
          case '--ui':
          case '-u':
            mochaRunnerOptions.ui = (this.parseNextString(args) as 'bdd' | 'exports' | 'qunit' | 'tdd') ?? DEFAULT_MOCHA_OPTIONS.ui!;
            break;
          case '--grep':
          case '-g': {
            let arg = `${this.parseNextString(args)}`;
            if (arg.startsWith('/') && arg.endsWith('/')) {
              arg = arg.substring(1, arg.length - 1);
            }
            mochaRunnerOptions.grep = arg;
            break;
          }
          default:
            this.log.debug(`Ignoring option "${args[0]}" as it is not supported.`);
            break;
        }
      }
    });
    return mochaRunnerOptions;
  }

  private parseNextString(args: string[]): string | undefined {
    if (args.length > 1) {
      return args[1];
    } else {
      return undefined;
    }
  }
}
