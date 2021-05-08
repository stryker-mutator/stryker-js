import path from 'path';

import { StrykerOptions, strykerCoreSchema } from '@stryker-mutator/api/core';
import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';

import { ConfigReader } from '../../../src/config/config-reader';
import { coreTokens } from '../../../src/di';
import { OptionsValidator } from '../../../src/config/options-validator';
import { resolveFromRoot } from '../../helpers/test-utils';

describe(ConfigReader.name, () => {
  let sut: ConfigReader;

  function createSut(cliOptions: Partial<StrykerOptions>): ConfigReader {
    return testInjector.injector
      .provideValue(coreTokens.cliOptions, cliOptions)
      .provideValue(coreTokens.validationSchema, strykerCoreSchema)
      .provideClass(coreTokens.optionsValidator, OptionsValidator)
      .injectClass(ConfigReader);
  }

  const resolveTestResource = resolveFromRoot.bind(undefined, 'testResources', 'config-reader');

  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
  });

  afterEach(() => {
    process.chdir(originalCwd);
  });

  describe('readConfig()', () => {
    it('should use cli options', () => {
      process.chdir(resolveTestResource('empty-json'));
      sut = createSut({ some: 'option', someOther: 2 });
      const result = sut.readConfig();
      expect(result.some).to.be.eq('option');
      expect(result.someOther).to.be.eq(2);
    });

    it('should throw an error with a non-existing config file', () => {
      sut = createSut({ configFile: 'no-file.js' });

      expect(() => sut.readConfig()).throws(`File ${path.resolve('no-file.js')} does not exist!`);
    });

    describe('without config file or CLI options', () => {
      it('should parse the stryker.conf.js config in cwd', () => {
        process.chdir(resolveTestResource('js'));
        sut = createSut({});

        const result = sut.readConfig();

        expect(result.type).to.be.eq('js');
        expect(testInjector.logger.warn).not.called;
      });

      it('should use the stryker.conf.json file in cwd', () => {
        process.chdir(resolveTestResource('json'));
        sut = createSut({});

        const result = sut.readConfig();

        expect(result.type).to.be.eq('json');
        expect(testInjector.logger.warn).not.called;
      });

      it('should use the stryker.conf.js file if both stryker.conf.js and stryker.conf.json are available', () => {
        process.chdir(resolveTestResource('json-and-js'));
        sut = createSut({});

        const result = sut.readConfig();

        expect(result.type).to.be.eq('js');
        expect(testInjector.logger.warn).not.called;
      });

      it.only('should use the default config if no stryker.conf file was found', () => {
        process.chdir(resolveTestResource('no-config'));

        sut = createSut({});
        const result = sut.readConfig();

        expect(result).to.deep.equal(factory.strykerOptions());
        expect(testInjector.logger.warn).not.called;
      });
    });

    describe('with config file', () => {
      it('should read config file', () => {
        sut = createSut({ configFile: 'testResources/config-reader/valid.conf.js' });

        const result = sut.readConfig();

        expect(result.valid).to.be.eq('config');
        expect(result.should).to.be.eq('be');
        expect(result.read).to.be.eq(true);
        expect(testInjector.logger.warn).not.called;
      });

      it('should give precedence to CLI options', () => {
        sut = createSut({ configFile: 'testResources/config-reader/valid.conf.js', read: false });

        const result = sut.readConfig();

        expect(result.read).to.be.eq(false);
        expect(testInjector.logger.warn).not.called;
      });

      it('should read a json config file', () => {
        sut = createSut({ configFile: 'testResources/config-reader/valid.json' });

        const result = sut.readConfig();

        expect(result.valid).to.be.eq('config');
        expect(result.should).to.be.eq('be');
        expect(result.read).to.be.eq(true);
        expect(testInjector.logger.warn).not.called;
      });
    });
    describe('when the config is not a function or object', () => {
      it('should report a fatal error', () => {
        sut = createSut({ configFile: 'testResources/config-reader/invalid.conf.js' });
        expect(() => sut.readConfig()).throws();
        expect(testInjector.logger.fatal).calledWithMatch(
          sinon
            .match('Config file must export an object!')
            .and(sinon.match("@type {import('@stryker-mutator/api/core').StrykerOptions}").and(sinon.match('module.exports = {')))
        );
      });

      it('should throw an error', () => {
        sut = createSut({ configFile: 'testResources/config-reader/invalid.conf.js' });
        expect(() => sut.readConfig()).throws('Config file must export an object');
      });
    });

    describe('with an existing file, but has syntax errors', () => {
      beforeEach(() => {
        sut = createSut({ configFile: 'testResources/config-reader/syntax-error.conf.js' });
      });

      it('should throw an error', () => {
        expect(() => sut.readConfig()).throws('Invalid config file. Inner error: SyntaxError: Unexpected identifier');
      });
    });

    describe('deprecation informations', () => {
      it('should report deprecation on module.export = function(config) {}', () => {
        sut = createSut({ configFile: 'testResources/config-reader/deprecatedFunction.conf.js' });
        sut.readConfig();

        expect(testInjector.logger.warn).calledWithMatch(
          'Usage of `module.export = function(config) {}` is deprecated. Please use `module.export = {}` or a "stryker.conf.json" file. For more details, see https://stryker-mutator.io/blog/2020-03-11/stryker-version-3#new-config-format'
        );
      });
    });
  });
});
