import { expect } from 'chai';
import * as sinon from 'sinon';
import { Logger } from 'log4js';
import { Config } from 'stryker-api/config';
import ConfigValidator from './../../src/ConfigValidator';
import currentLogMock from '../helpers/log4jsMock';
import { testFramework, Mock } from '../helpers/producers';

describe('ConfigValidator', () => {

  let config: Config;
  let sandbox: sinon.SinonSandbox;
  let exitStub: sinon.SinonStub;
  let sut: ConfigValidator;
  let log: Mock<Logger>;

  beforeEach(() => {
    log = currentLogMock();
    config = new Config();
    sandbox = sinon.createSandbox();
    exitStub = sandbox.stub(process, 'exit');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should validate with default config', () => {
    sut = new ConfigValidator(config, testFramework());
    sut.validate();
    expect(exitStub).not.called;
    expect(log.fatal).not.called;
  });

  it('should be invalid with coverageAnalysis "perTest" without a testFramework', () => {
    config.coverageAnalysis = 'perTest';
    sut = new ConfigValidator(config, null);
    sut.validate();
    expect(exitStub).calledWith(1);
    expect(log.fatal).calledWith('Configured coverage analysis "perTest" requires there to be a testFramework configured. Either configure a testFramework or set coverageAnalysis to "all" or "off".');
  });

  describe('thresholds', () => {

    it('should be invalid with thresholds < 0 or > 100', () => {
      config.thresholds.high = -1;
      config.thresholds.low = 101;
      sut = new ConfigValidator(config, testFramework());
      sut.validate();
      expect(exitStub).calledWith(1);
      expect(log.fatal).calledWith('`thresholds.high` is lower than `thresholds.low` (-1 < 101)');
      expect(log.fatal).calledWith('thresholds.high should be between 0 and 100 (was -1)');
      expect(log.fatal).calledWith('thresholds.low should be between 0 and 100 (was 101)');
    });

    it('should be invalid with thresholds.high null', () => {
      (config.thresholds.high as any) = null;
      config.thresholds.low = 101;
      sut = new ConfigValidator(config, testFramework());
      sut.validate();
      expect(exitStub).calledWith(1);
      expect(log.fatal).calledWith('thresholds.high is invalid, expected a number between 0 and 100 (was null).');
    });
  });

  it('should downgrade coverageAnalysis when transpilers are specified (for now)', () => {
    config.transpilers.push('a transpiler');
    config.coverageAnalysis = 'all';
    sut = new ConfigValidator(config, testFramework());
    sut.validate();
    expect(log.info).calledWith('Disabled coverage analysis for this run (off). Coverage analysis using transpilers is not supported yet.');
    expect(config.coverageAnalysis).eq('off');
  });

});
