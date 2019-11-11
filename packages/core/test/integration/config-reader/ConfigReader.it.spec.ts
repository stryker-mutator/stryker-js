import * as path from 'path';

import { Config } from '@stryker-mutator/api/config';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import * as sinon from 'sinon';

import ConfigReader from '../../../src/config/ConfigReader';
import { coreTokens } from '../../../src/di';

describe(ConfigReader.name, () => {
  let sut: ConfigReader;

  function createSut(cliOptions: Partial<StrykerOptions>): ConfigReader {
    return testInjector.injector.provideValue(coreTokens.cliOptions, cliOptions).injectClass(ConfigReader);
  }

  describe('readConfig()', () => {
    let result: Config;
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
          const mockCwd = path.resolve(__dirname, '..', '..', '..', 'testResources', 'config-reader');
          sinon.stub(process, 'cwd').returns(mockCwd);
          sut = createSut({});

          result = sut.readConfig();

          expect(result.valid).to.be.eq('config');
          expect(result.should).to.be.eq('be');
          expect(result.read).to.be.eq(true);
          expect(testInjector.logger.warn).not.called;
        });
      });

      describe('without a stryker.conf.js in the CWD', () => {
        it('should return default config', () => {
          const mockCwd = path.resolve(__dirname, '..', '..', '..', 'testResources', 'config-reader', 'no-config');
          sinon.stub(process, 'cwd').returns(mockCwd);

          sut = createSut({});

          result = sut.readConfig();

          expect(result).to.deep.equal(new Config());
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

    describe('with an existing file, but not a function', () => {
      beforeEach(() => {
        sut = createSut({ configFile: 'testResources/config-reader/invalid.conf.js' });
      });

      it('should report a fatal error', () => {
        expect(() => sut.readConfig()).throws();
        expect(testInjector.logger.fatal).to.have.been.calledWith(`Config file must export a function!
  module.exports = function(config) {
    config.set({
      // your config
    });
  };`);
      });

      it('should throw an error', () => {
        expect(() => sut.readConfig()).throws('Config file must export a function');
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
  });
});
