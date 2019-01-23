import { expect } from 'chai';
import * as path from 'path';
import { Config } from 'stryker-api/config';
import * as logging from 'stryker-api/logging';
import ConfigReader from '../../../src/config/ConfigReader';
import currentLogMock from '../../helpers/logMock';
import { Mock } from '../../helpers/producers';
import * as sinon from 'sinon';

describe('ConfigReader', () => {

  let sut: ConfigReader;
  let log: Mock<logging.Logger>;

  beforeEach(() => {
    log = currentLogMock();
  });

  it('should create a logger with the correct name', () => {
    sut = new ConfigReader({});
    expect(logging.getLogger).to.have.been.calledWith('ConfigReader');
  });

  describe('readConfig()', () => {
    let result: Config;
    describe('without config file', () => {

      beforeEach(() => {
        sut = new ConfigReader({ some: 'option', someOther: 2 });
        result = sut.readConfig();
      });

      it('should only use supplied config', () => {
        expect(result.some).to.be.eq('option');
        expect(result.someOther).to.be.eq(2);
        expect(log.warn).not.called;
      });
    });

    describe('without config file or CLI options', () => {
      describe('with a stryker.conf.js in the CWD', () => {
        it('should parse the config', () => {
          const mockCwd = process.cwd() + '/testResources/config-reader';
          sinon.stub(process, 'cwd').returns(mockCwd);
          sut = new ConfigReader({});

          result = sut.readConfig();

          expect(result.valid).to.be.eq('config');
          expect(result.should).to.be.eq('be');
          expect(result.read).to.be.eq(true);
          expect(log.warn).not.called;
        });
      });

      describe('without a stryker.conf.js in the CWD', () => {
        it('should return default config', () => {
          const mockCwd = process.cwd() + '/testResources/config-reader/no-config';
          sinon.stub(process, 'cwd').returns(mockCwd);

          sut = new ConfigReader({});

          result = sut.readConfig();

          expect(result).to.deep.equal(new Config());
          expect(log.warn).not.called;
        });
      });
    });

    describe('with config file', () => {
      it('should read config file', () => {
        sut = new ConfigReader({ configFile: 'testResources/config-reader/valid.conf.js' });

        result = sut.readConfig();

        expect(result.valid).to.be.eq('config');
        expect(result.should).to.be.eq('be');
        expect(result.read).to.be.eq(true);
        expect(log.warn).not.called;
      });

      describe('with CLI options', () => {
        it('should give precedence to CLI options', () => {
          sut = new ConfigReader({ configFile: 'testResources/config-reader/valid.conf.js', read: false });

          result = sut.readConfig();

          expect(result.read).to.be.eq(false);
          expect(log.warn).not.called;
        });
      });
    });

    describe('with non-existing config file', () => {
      beforeEach(() => {
        sut = new ConfigReader({ configFile: 'no-file.js' });
      });

      it('should throw an error', () => {
        expect(() => sut.readConfig()).throws(`File ${path.resolve('no-file.js')} does not exist!`);
      });
    });

    describe('with an existing file, but not a function', () => {

      beforeEach(() => {
        sut = new ConfigReader({ configFile: 'testResources/config-reader/invalid.conf.js' });
      });

      it('should report a fatal error', () => {
        expect(() => sut.readConfig()).throws();
        expect(log.fatal).to.have.been.calledWith(`Config file must export a function!
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
        sut = new ConfigReader({ configFile: 'testResources/config-reader/syntax-error.conf.js' });
      });

      it('should throw an error', () => {
        expect(() => sut.readConfig()).throws('Invalid config file. Inner error: SyntaxError: Unexpected identifier');
      });
    });

    describe('with deprecated reporter property', () => {
      it('should log a warning when a single reporter is specified', () => {
        const reporterName = 'html';
        sut = new ConfigReader({ reporter: reporterName });

        const result = sut.readConfig();

        expect(result.reporters).to.deep.eq([reporterName]);
        expect(log.warn).calledWithExactly(`DEPRECATED: please change the config setting 'reporter: "${reporterName}"' into 'reporters: ["${reporterName}"]'`);
      });

      it('should log a warning when multiple reporters are specified', () => {
        const configuredReporters = ['html', 'progress'];
        sut = new ConfigReader({ reporter: configuredReporters });

        const result = sut.readConfig();

        expect(result.reporters).to.deep.eq(configuredReporters);
        expect(log.warn).calledWithExactly(`DEPRECATED: please change the config setting 'reporter: ${JSON.stringify(configuredReporters)}' into 'reporters: ${JSON.stringify(configuredReporters)}'`);
      });

      it('should log a warning when timeoutMs is specified', () => {
        const timeoutMs = 30000;
        sut = new ConfigReader({ timeoutMs });

        const result = sut.readConfig();

        expect(result.timeoutMS).to.deep.eq(timeoutMs);
        expect(log.warn).calledWithExactly(`DEPRECATED: please change the config setting 'timeoutMs: ${timeoutMs}' into 'timeoutMS: ${timeoutMs}'`);
      });
    });
  });
});
