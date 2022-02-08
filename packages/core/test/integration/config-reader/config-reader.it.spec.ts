import path from 'path';

import { strykerCoreSchema } from '@stryker-mutator/api/core';
import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';

import { ConfigReader } from '../../../src/config/config-reader.js';
import { coreTokens } from '../../../src/di/index.js';
import { OptionsValidator } from '../../../src/config/options-validator.js';
import { resolveFromRoot } from '../../helpers/test-utils.js';

describe(ConfigReader.name, () => {
  let sut: ConfigReader;

  function createSut(): ConfigReader {
    return testInjector.injector
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
    it('should use cli options', async () => {
      process.chdir(resolveTestResource('empty-json'));
      sut = createSut();
      const result = await sut.readConfig({ some: 'option', someOther: 2 });
      expect(result.some).to.be.eq('option');
      expect(result.someOther).to.be.eq(2);
    });

    it('should throw an error with a non-existing config file', async () => {
      sut = createSut();

      await expect(sut.readConfig({ configFile: 'no-file.js' })).rejectedWith(`File ${path.resolve('no-file.js')} does not exist!`);
    });

    describe('without config file or CLI options', () => {
      it('should parse the stryker.conf.js config in cwd', async () => {
        process.chdir(resolveTestResource('js'));
        sut = createSut();

        const result = await sut.readConfig({});

        expect(result.type).to.be.eq('js');
        expect(testInjector.logger.warn).not.called;
      });

      it('should use the stryker.conf.json file in cwd', async () => {
        process.chdir(resolveTestResource('json'));
        sut = createSut();

        const result = await sut.readConfig({});

        expect(result.type).to.be.eq('json');
        expect(testInjector.logger.warn).not.called;
      });

      it('should use the stryker.conf.js file if both stryker.conf.js and stryker.conf.json are available', async () => {
        process.chdir(resolveTestResource('json-and-js'));
        sut = createSut();

        const result = await sut.readConfig({});

        expect(result.type).to.be.eq('js');
        expect(testInjector.logger.warn).not.called;
      });

      it('should use the default config if no stryker.conf file was found', async () => {
        process.chdir(resolveTestResource('no-config'));

        sut = createSut();
        const result = await sut.readConfig({});

        expect(result).to.deep.equal(factory.strykerOptions());
        expect(testInjector.logger.warn).not.called;
      });
    });

    describe('with config file', () => {
      it('should read config file', async () => {
        sut = createSut();

        const result = await sut.readConfig({ configFile: 'testResources/config-reader/valid.conf.js' });

        expect(result.valid).to.be.eq('config');
        expect(result.should).to.be.eq('be');
        expect(result.read).to.be.eq(true);
        expect(testInjector.logger.warn).not.called;
      });

      it('should give precedence to CLI options', async () => {
        sut = createSut();

        const result = await sut.readConfig({ configFile: 'testResources/config-reader/valid.conf.js', read: false });

        expect(result.read).to.be.eq(false);
        expect(testInjector.logger.warn).not.called;
      });

      it('should read a json config file', async () => {
        sut = createSut();

        const result = await sut.readConfig({ configFile: 'testResources/config-reader/valid.json' });

        expect(result.valid).to.be.eq('config');
        expect(result.should).to.be.eq('be');
        expect(result.read).to.be.eq(true);
        expect(testInjector.logger.warn).not.called;
      });
    });
    describe('when the config is not a function or object', () => {
      it('should report a fatal error', async () => {
        sut = createSut();
        await expect(sut.readConfig({ configFile: 'testResources/config-reader/invalid.conf.js' })).rejected;
        expect(testInjector.logger.fatal).calledWithMatch(
          sinon
            .match('Config file must export an object!')
            .and(sinon.match("@type {import('@stryker-mutator/api/core').StrykerOptions}").and(sinon.match('module.exports = {')))
        );
      });

      it('should throw an error', async () => {
        sut = createSut();
        await expect(sut.readConfig({ configFile: 'testResources/config-reader/invalid.conf.js' })).rejectedWith('Config file must export an object');
      });
    });

    describe('with an existing file, but has syntax errors', () => {
      beforeEach(() => {
        sut = createSut();
      });

      it('should throw an error', async () => {
        await expect(sut.readConfig({ configFile: 'testResources/config-reader/syntax-error.conf.js' })).rejectedWith(
          'Invalid config file. Inner error: SyntaxError: Unexpected identifier'
        );
      });
    });

    describe('deprecation information', () => {
      it('should report deprecation on module.export = function(config) {}', async () => {
        sut = createSut();
        await sut.readConfig({ configFile: 'testResources/config-reader/deprecatedFunction.conf.js' });

        expect(testInjector.logger.warn).calledWithMatch(
          'Usage of `module.exports = function(config) {}` is deprecated. Please use `module.export = {}` or a "stryker.conf.json" file. For more details, see https://stryker-mutator.io/blog/2020-03-11/stryker-version-3#new-config-format'
        );
      });
    });
  });
});
