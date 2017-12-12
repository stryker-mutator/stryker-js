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

  function breakConfig(oldConfig: Config, key: keyof Config, value: any): any {
    return Object.assign({}, oldConfig, { [key]: value });
  }

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

  it('should be invalid with invalid logLevel', () => {
    config.logLevel = 'thisTestPasses';
    sut = new ConfigValidator(config, testFramework());
    sut.validate();
    expect(exitStub).calledWith(1);
    expect(log.fatal).calledWith('`logLevel` is invalid, expected one of `fatal`, `error`, `warn`, `info`, `debug`, `trace`, `all` and `off`');
  });

  it('should be invalid with nonnumeric timeoutMs', () => {
    let brokenConfig = breakConfig(config, 'timeoutMs', 'break');
    sut = new ConfigValidator(brokenConfig, testFramework());
    sut.validate();
    expect(exitStub).calledWith(1);
    expect(log.fatal).calledWith('timeoutMs is invalid, expected a number');
  });

  it('should be invalid with nonnumeric timeoutFactor', () => {
    let brokenConfig = breakConfig(config, 'timeoutFactor', 'break');
    sut = new ConfigValidator(brokenConfig, testFramework());
    sut.validate();
    expect(exitStub).calledWith(1);
    expect(log.fatal).calledWith('timeoutFactor is invalid, expected a number');
  });

  it('should be invalid with invalid coverageAnalysis', () => {
    let brokenConfig = breakConfig(config, 'coverageAnalysis', 'invalid');
    sut = new ConfigValidator(brokenConfig, testFramework());
    sut.validate();
    expect(exitStub).calledWith(1);
    expect(log.fatal).calledWith('Value "invalid" is invalid for `coverageAnalysis`. Expected one of the folowing: "perTest", "all", "off"');
  });
});
