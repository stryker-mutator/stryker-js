import * as sinon from 'sinon';
import { expect } from 'chai';
import * as log4js from 'log4js';
const cfg: { parseConfig: sinon.SinonStub } = require('karma/lib/config');
import KarmaConfigReader from '../../src/KarmaConfigReader';
import LoggerStub from '../helpers/LoggerStub';
import * as path from 'path';
import * as utils from '../../src/utils';

describe('KarmaConfigReader', () => {
  let sandbox: sinon.SinonSandbox;
  let sut: KarmaConfigReader;
  let log: LoggerStub;
  let karmaConfigModule: sinon.SinonStub;

  beforeEach(() => {
    log = new LoggerStub();
    sandbox = sinon.sandbox.create();
    karmaConfigModule = sandbox.stub();
    sandbox.stub(utils, 'requireModule').returns(karmaConfigModule);
    sandbox.stub(cfg, 'parseConfig');
    sandbox.stub(log4js, 'getLogger').returns(log);
  });

  afterEach(() => sandbox.restore());

  describe('read', () => {

    beforeEach(() => sut = new KarmaConfigReader('someLocation'));

    it('should log an error when the config has validation errors', () => {
      const expectedConfigFileLocation = path.resolve('someLocation');
      cfg.parseConfig.throws(new Error('Config error'));
      sut.read();
      expect(log.error).to.have.been.calledWith(sinon.match(`Could not read karma configuration from ${expectedConfigFileLocation}.`), sinon.match.has('message', 'Config error'));
      expect(cfg.parseConfig).to.have.been.calledWith(expectedConfigFileLocation);
    });

    it('should load the config', () => {
      karmaConfigModule.returns('expectedConfig');
      const acualConfig = sut.read();
      expect(karmaConfigModule).to.have.been.calledWith(sinon.match((obj: any) => typeof obj.set === 'function'));
      expect(acualConfig).to.be.ok;
    });
  });

  describe('read without karmaConfigFile', () => {
    beforeEach(() => sut = new KarmaConfigReader(''));

    it('should not read anything', () => {
      expect(sut.read()).to.be.null;
    });
  });
});