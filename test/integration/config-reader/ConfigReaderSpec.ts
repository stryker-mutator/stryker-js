import * as path from 'path';
import * as log4js from 'log4js';
import * as sinon from 'sinon';
import { expect } from 'chai';
import ConfigReader from '../../../src/ConfigReader';
import { Config } from 'stryker-api/config';
import log from '../../helpers/log4jsMock';

describe('ConfigReader', () => {
  let sut: ConfigReader;
  let sandbox: sinon.SinonSandbox;
  const baseDir = process.cwd();

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(process, 'exit');
  });

  afterEach(() => process.chdir(baseDir));

  it('should create a logger with the correct name', () => {
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
          process.chdir(process.cwd() + '/testResources/config-reader');
          sut = new ConfigReader({});

          result = sut.readConfig();

          expect(result['valid']).to.be.eq('config');
          expect(result['should']).to.be.eq('be');
          expect(result['read']).to.be.eq(true);
        });
      });

      describe('without a stryker.conf.js in the CWD', () => {
        it('should report a fatal error', () => {
          const emptyDir = process.cwd() + '/testResources/config-reader/no-config';
          process.chdir(emptyDir);
          sut = new ConfigReader({});
          result = sut.readConfig();
          expect(log.fatal).to.have.been.calledWith(`File ${path.resolve(emptyDir, 'stryker.conf.js')} does not exist!`);
        });
      });
    });

    describe('with invalid coverageAnalysis', () => {
      beforeEach(() => {
        sut = new ConfigReader({ coverageAnalysis: <any>'invalid' });
        result = sut.readConfig();
      });

      it('should report a fatal error', () => {
        expect(log.fatal).to.have.been.calledWith('Value "invalid" is invalid for `coverageAnalysis`. Expected one of the folowing: "perTest", "all", "off"');
      });

      it('should exit with 1', () => {
        expect(process.exit).to.have.been.calledWith(1);
      });
    });

    describe('with config file', () => {

      beforeEach(() => {
        sut = new ConfigReader({ configFile: 'testResources/config-reader/valid.conf.js' });
        result = sut.readConfig();
      });

      it('should read config file', () => {
        expect(result['valid']).to.be.eq('config');
        expect(result['should']).to.be.eq('be');
        expect(result['read']).to.be.eq(true);
      });

      it('should change the cwd', () => {
        expect(process.cwd()).to.eq(path.dirname(path.resolve(baseDir, 'testResources/config-reader/valid.conf.js')));
      });
    });

    describe('with non-existing config file', () => {
      const nonExistingFile = 'testResources/config-reader/no-config/thisFileDoesNotExist';
      beforeEach(() => {
        sut = new ConfigReader({ configFile: nonExistingFile });
      });

      it('should report a fatal error', () => {
        const expectedFile = path.resolve(process.cwd(), nonExistingFile);
        result = sut.readConfig();
        expect(log.fatal).to.have.been.calledWith(`File ${expectedFile} does not exist!`);
      });

      it('should exit with 1', () => {
        result = sut.readConfig();
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

  afterEach(() => {
    sandbox.restore();
  });
});