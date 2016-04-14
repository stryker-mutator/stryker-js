import {expect} from 'chai';
import * as log4js from 'log4js';
import * as sinon from 'sinon';
import ConfigReader from '../../../src/ConfigReader';
import {Config} from '../../../src/api/config';
import log from '../../helpers/log4jsMock';

describe('ConfigReader', () => {
  let sut: ConfigReader;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(process, 'exit');
  });

  it('should create a logger with the correct name', () => {
    expect(log4js.getLogger).to.have.been.calledWith('ConfigReader');
  });

  describe('readConfig()', () => {
    let result: Config;
    describe('without config file', () => {

      beforeEach(() => {
        sut = new ConfigReader({ some: 'option', someOther: 2 }, null);
        result = sut.readConfig();
      });

      it('should only use supplied config', () => {
        expect(result['some']).to.be.eq('option');
        expect(result['someOther']).to.be.eq(2);
      });
    });

    describe('with config file', () => {

      beforeEach(() => {
        sut = new ConfigReader(null, '../../test/integration/config-reader/valid.conf.js');
        result = sut.readConfig();
      });

      it('should read config file', () => {
        expect(result['valid']).to.be.eq('config');
        expect(result['should']).to.be.eq('be');
        expect(result['read']).to.be.eq(true);
      });
    });

    describe('with non-existing config file', () => {
      beforeEach(() => {
        sut = new ConfigReader(null, '/did/you/know/that/this/file/does/not/exists/questionmark');
        result = sut.readConfig();
      });

      it('should report a fatal error', () => {
        expect(log.fatal).to.have.been.calledWith('File %s does not exist!', '/did/you/know/that/this/file/does/not/exists/questionmark');
      });

      it('should exit with 1', () => {
        expect(process.exit).to.have.been.calledWith(1);
      });
    });

    describe('with an existing file, but not a module', () => {

      beforeEach(() => {
        sut = new ConfigReader(null, '../../test/integration/config-reader/invalid.conf.js');
        result = sut.readConfig();
      });

      it('should report a fatal error', () => {
        expect(log.fatal).to.have.been.calledWith(`Config file must export a function!
  module.exports = function(config) {
    config.set({
      // your config
    });
  };
`);
      });

      it('should exit with 1', () => {
        expect(process.exit).to.have.been.calledWith(1);
      });
    });

    describe('with an existing file, but has syntax errors', () => {

      beforeEach(() => {
        sut = new ConfigReader(null, '../../test/integration/config-reader/syntax-error.conf.js');
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