import { strykerCoreSchema } from '@stryker-mutator/api/core';
import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { ConfigReader } from '../../../src/config/config-reader.js';
import { coreTokens } from '../../../src/di/index.js';
import { OptionsValidator } from '../../../src/config/options-validator.js';
import { resolveFromRoot } from '../../helpers/test-utils.js';

describe.only(ConfigReader.name, () => {
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
    it('should throw an error with a non-existing config file', async () => {
      sut = createSut();

      await expect(sut.readConfig({ configFile: 'no-file.js' })).rejectedWith('Invalid config file "no-file.js". File does not exist!');
    });

    describe('without overridden config file', () => {
      it('should load the stryker.conf.js as mjs config in cwd', async () => {
        process.chdir(resolveTestResource('js-as-esm'));
        sut = createSut();

        const result = await sut.readConfig({});

        expect(result.type).to.be.eq('js');
      });

      it('should load the stryker.conf.js as cjs config in cwd', async () => {
        process.chdir(resolveTestResource('js-as-cjs'));
        sut = createSut();

        const result = await sut.readConfig({});

        expect(result.type).to.be.eq('js');
      });

      it('should load the stryker.conf.cjs config in cwd', async () => {
        process.chdir(resolveTestResource('cjs'));
        sut = createSut();

        const result = await sut.readConfig({});

        expect(result.type).to.be.eq('js');
      });

      it('should load the stryker.conf.mjs config in cwd', async () => {
        process.chdir(resolveTestResource('mjs'));
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

      it('should read a json config file', async () => {
        sut = createSut();

        const result = await sut.readConfig({ configFile: 'testResources/config-reader/valid.json' });

        expect(result.valid).to.be.eq('config');
        expect(result.should).to.be.eq('be');
        expect(result.read).to.be.eq(true);
        expect(testInjector.logger.warn).not.called;
      });
    });

    describe('with an existing file, but has syntax errors', () => {
      beforeEach(() => {
        sut = createSut();
      });

      it('should throw an error', async () => {
        await expect(sut.readConfig({ configFile: 'testResources/config-reader/syntax-error.conf.js' })).rejectedWith(
          'Invalid config file "testResources/config-reader/syntax-error.conf.js". Error during import. Inner error: SyntaxError: Unexpected identifier'
        );
      });
    });
  });
});
