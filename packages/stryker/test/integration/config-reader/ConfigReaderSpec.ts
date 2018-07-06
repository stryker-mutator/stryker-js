import { expect } from 'chai';
import * as log4js from 'stryker-api/logging';
import ConfigReader from '../../../src/config/ConfigReader';
import { Config } from 'stryker-api/config';
import currentLogMock from '../../helpers/logMock';
import { Mock } from '../../helpers/producers';

describe('ConfigReader', () => {
  let sut: ConfigReader;
  let log: Mock<log4js.Logger>;

  beforeEach(() => {
    log = currentLogMock();
    sandbox.stub(process, 'exit');
  });

  it('should create a logger with the correct name', () => {
    sut = new ConfigReader({});
    expect(log4js.getLogger).to.have.been.calledWith('ConfigReader');
  });

  describe('readConfig()', () => {
    let result: Config;
    describe('without config file', () => {

      beforeEach(() => {
        sut = new ConfigReader({ some: 'option', someOther: 2 });
        result = sut.readConfig();
      });

      it('should only use supplied config', () => {
        expect(result['some']).to.be.eq('option');
        expect(result['someOther']).to.be.eq(2);
      });
    });

    describe('without config file or CLI options', () => {
        describe('with a stryker.conf.js in the CWD', () => {
          it('should parse the config', () => {
            let mockCwd = process.cwd() + '/testResources/config-reader';
            sandbox.stub(process, 'cwd').returns(mockCwd);
            sut = new ConfigReader({});

            result = sut.readConfig();

            expect(result['valid']).to.be.eq('config');
            expect(result['should']).to.be.eq('be');
            expect(result['read']).to.be.eq(true);
          });
        });

        describe('without a stryker.conf.js in the CWD', () => {
          it('should return default config', () => {
            let mockCwd = process.cwd() + '/testResources/config-reader/no-config';
            sandbox.stub(process, 'cwd').returns(mockCwd);

            sut = new ConfigReader({});

            result = sut.readConfig(); 

            expect(result).to.deep.equal(new Config());
          });
        });
      });

    describe('with config file', () => {
      it('should read config file', () => {
        sut = new ConfigReader({ configFile: 'testResources/config-reader/valid.conf.js' });

        result = sut.readConfig();

        expect(result['valid']).to.be.eq('config');
        expect(result['should']).to.be.eq('be');
        expect(result['read']).to.be.eq(true);
      });

      describe('with CLI options', () => {
        it('should give precedence to CLI options', () => {
          sut = new ConfigReader({ configFile: 'testResources/config-reader/valid.conf.js', read: false });

          result = sut.readConfig();

          expect(result['read']).to.be.eq(false);
        });
      });
    });

    describe('with non-existing config file', () => {
      beforeEach(() => {
        sut = new ConfigReader({ configFile: '/did/you/know/that/this/file/does/not/exists/questionmark' });
        result = sut.readConfig();
      });

      it('should report a fatal error', () => {
        expect(log.fatal).to.have.been.calledWith(`File ${process.cwd()}//did/you/know/that/this/file/does/not/exists/questionmark does not exist!`);
      });

      it('should exit with 1', () => {
        expect(process.exit).to.have.been.calledWith(1);
      });
    });

    describe('with an existing file, but not a module', () => {

      beforeEach(() => {
        sut = new ConfigReader({ configFile: 'testResources/config-reader/invalid.conf.js' });
        result = sut.readConfig();
      });

      it('should report a fatal error', () => {
        expect(log.fatal).to.have.been.calledWith(`Config file must export a function!
  module.exports = function(config) {
    config.set({
      // your config
    });
  };`);
      });

      it('should exit with 1', () => {
        expect(process.exit).to.have.been.calledWith(1);
      });
    });

    describe('with an existing file, but has syntax errors', () => {

      beforeEach(() => {
        sut = new ConfigReader({ configFile: 'testResources/config-reader/syntax-error.conf.js' });
        result = sut.readConfig();
      });

      it('should report a fatal error', () => {
        expect(log.fatal).to.have.been.calledWithMatch(/Invalid config file!.*/);
      });
    });
  });
});