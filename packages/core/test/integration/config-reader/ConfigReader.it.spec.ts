import * as path from 'path';

import { StrykerOptions, strykerCoreSchema } from '@stryker-mutator/api/core';
import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import * as sinon from 'sinon';

import ConfigReader from '../../../src/config/ConfigReader';
import { coreTokens } from '../../../src/di';
import { OptionsValidator } from '../../../src/config/OptionsValidator';

describe(ConfigReader.name, () => {
  let sut: ConfigReader;

  function createSut(cliOptions: Partial<StrykerOptions>): ConfigReader {
    return testInjector.injector
      .provideValue(coreTokens.cliOptions, cliOptions)
      .provideValue(coreTokens.validationSchema, strykerCoreSchema)
      .provideClass(coreTokens.optionsValidator, OptionsValidator)
      .injectClass(ConfigReader);
  }

  describe('readConfig()', () => {
    let result: StrykerOptions;
    describe('without config file', () => {
      beforeEach(() => {
        sut = createSut({ some: 'option', someOther: 2 });
        result = sut.readConfig();
      });

      it('should only use supplied config', () => {
        expect(result.some).to.be.eq('option');
        expect(result.someOther).to.be.eq(2);
        expect(testInjector.logger.warn).not.called;
      });
    });

    describe('without config file or CLI options', () => {
      describe('with a stryker.conf.js in the CWD', () => {
        it('should parse the config', () => {
          const mockCwd = path.resolve(__dirname, '..', '..', '..', 'testResources', 'config-reader', 'js');
          sinon.stub(process, 'cwd').returns(mockCwd);
          sut = createSut({});

          result = sut.readConfig();

          expect(result.type).to.be.eq('js');
          expect(testInjector.logger.warn).not.called;
        });
      });

      describe('with a stryker.conf.json in the CWD', () => {
        it('should parse the config', () => {
          const mockCwd = path.resolve(__dirname, '..', '..', '..', 'testResources', 'config-reader', 'json');
          sinon.stub(process, 'cwd').returns(mockCwd);
          sut = createSut({});

          result = sut.readConfig();

          expect(result.type).to.be.eq('json');
          expect(testInjector.logger.warn).not.called;
        });
      });

      describe('with a stryker.conf.js and stryker.conf.json in the CWD', () => {
        it('should parse the js config', () => {
          const mockCwd = path.resolve(__dirname, '..', '..', '..', 'testResources', 'config-reader', 'json-and-js');
          sinon.stub(process, 'cwd').returns(mockCwd);
          sut = createSut({});

          result = sut.readConfig();

          expect(result.type).to.be.eq('js');
          expect(testInjector.logger.warn).not.called;
        });
      });

      describe('without a stryker.conf.js in the CWD', () => {
        it('should return default config', () => {
          const mockCwd = path.resolve(__dirname, '..', '..', '..', 'testResources', 'config-reader', 'no-config');
          sinon.stub(process, 'cwd').returns(mockCwd);

          sut = createSut({});

          result = sut.readConfig();

          expect(result).to.deep.equal(factory.strykerOptions());
          expect(testInjector.logger.warn).not.called;
        });
      });
    });

    describe('with config file', () => {
      it('should read config file', () => {
        sut = createSut({ configFile: 'testResources/config-reader/valid.conf.js' });

        result = sut.readConfig();

        expect(result.valid).to.be.eq('config');
        expect(result.should).to.be.eq('be');
        expect(result.read).to.be.eq(true);
        expect(testInjector.logger.warn).not.called;
      });

      describe('with CLI options', () => {
        it('should give precedence to CLI options', () => {
          sut = createSut({ configFile: 'testResources/config-reader/valid.conf.js', read: false });

          result = sut.readConfig();

          expect(result.read).to.be.eq(false);
          expect(testInjector.logger.warn).not.called;
        });
      });
    });

    describe('with non-existing config file', () => {
      beforeEach(() => {
        sut = createSut({ configFile: 'no-file.js' });
      });

      it('should throw an error', () => {
        expect(() => sut.readConfig()).throws(`File ${path.resolve('no-file.js')} does not exist!`);
      });
    });

    describe('with an existing file, but not a function or object', () => {
      beforeEach(() => {
        sut = createSut({ configFile: 'testResources/config-reader/invalid.conf.js' });
      });

      it('should report a fatal error', () => {
        expect(() => sut.readConfig()).throws();
        expect(testInjector.logger.fatal).calledWithMatch(
          sinon
            .match('Config file must export an object!')
            .and(sinon.match("@type {import('@stryker-mutator/api/core').StrykerOptions}").and(sinon.match('module.exports = {')))
        );
      });

      it('should throw an error', () => {
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

    describe('with json config file', () => {
      it('should read config file', () => {
        sut = createSut({ configFile: 'testResources/config-reader/valid.json' });

        result = sut.readConfig();

        expect(result.valid).to.be.eq('config');
        expect(result.should).to.be.eq('be');
        expect(result.read).to.be.eq(true);
        expect(testInjector.logger.warn).not.called;
      });
    });
  });
});
