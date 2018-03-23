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
      expect(log.fatal).calledWith('Value "-1" is invalid for `thresholds.high`. Expected a number between 0 and 100');
      expect(log.fatal).calledWith('Value "101" is invalid for `thresholds.low`. Expected a number between 0 and 100');
    });

    it('should be invalid with thresholds.high null', () => {
      (config.thresholds.high as any) = null;
      config.thresholds.low = 101;
      sut = new ConfigValidator(config, testFramework());
      sut.validate();
      expect(exitStub).calledWith(1);
      expect(log.fatal).calledWith('Value "null" is invalid for `thresholds.high`. Expected a number between 0 and 100');
    });
  });

  it('should be invalid with coverageAnalysis when 2 transpilers are specified (for now)', () => {
    config.transpilers.push('a transpiler');
    config.transpilers.push('a second transpiler');
    config.coverageAnalysis = 'all';
    sut = new ConfigValidator(config, testFramework());
    sut.validate();
    expect(log.fatal).calledWith('Value "all" for `coverageAnalysis` is invalid with multiple transpilers' +
      ' (configured transpilers: a transpiler, a second transpiler). Please report this to the Stryker team' +
      ' if you whish this feature to be implemented');
    expect(exitStub).calledWith(1);
  });

  it('should be invalid with invalid logLevel', () => {
    config.logLevel = 'thisTestPasses';
    sut = new ConfigValidator(config, testFramework());
    sut.validate();
    expect(exitStub).calledWith(1);
    expect(log.fatal).calledWith('Value "thisTestPasses" is invalid for `logLevel`. Expected one of the following: "fatal", "error", "warn", "info", "debug", "trace", "all", "off"');
  });

  it('should be invalid with nonnumeric timeoutMs', () => {
    let brokenConfig = breakConfig(config, 'timeoutMs', 'break');
    sut = new ConfigValidator(brokenConfig, testFramework());
    sut.validate();
    expect(exitStub).calledWith(1);
    expect(log.fatal).calledWith('Value "break" is invalid for `timeoutMs`. Expected a number');
  });

  it('should be invalid with nonnumeric timeoutFactor', () => {
    let brokenConfig = breakConfig(config, 'timeoutFactor', 'break');
    sut = new ConfigValidator(brokenConfig, testFramework());
    sut.validate();
    expect(exitStub).calledWith(1);
    expect(log.fatal).calledWith('Value "break" is invalid for `timeoutFactor`. Expected a number');
  });

  describe('plugins', () => {
    it('should be invalid with non-array plugins', () => {
      let brokenConfig = breakConfig(config, 'plugins', 'stryker-typescript');
      sut = new ConfigValidator(brokenConfig, testFramework());
      sut.validate();
      expect(exitStub).calledWith(1);
      expect(log.fatal).calledWith('Value "stryker-typescript" is invalid for `plugins`. Expected an array');
    });

    it('should be invalid with non-string array elements', () => {
      let brokenConfig = breakConfig(config, 'plugins', ['stryker-jest', 0]);
      sut = new ConfigValidator(brokenConfig, testFramework());
      sut.validate();
      expect(exitStub).calledWith(1);
      expect(log.fatal).calledWith('Value "0" is an invalid element of `plugins`. Expected a string');
    });
  });

  describe('mutator', () => {
    it('should be invalid with non-string mutator', () => {
      let brokenConfig = breakConfig(config, 'mutator', 0);
      sut = new ConfigValidator(brokenConfig, testFramework());
      sut.validate();
      expect(exitStub).calledWith(1);
      expect(log.fatal).calledWith('Value "0" is invalid for `mutator`. Expected either a string or an object');
    });

    describe('as an object', () => {
      it('should be valid with string mutator name and string array excluded mutations', () => {
        let validConfig = breakConfig(config, 'mutator', {
          name: 'es5',
          excludedMutations: ['BooleanSubstitution']
        });
        sut = new ConfigValidator(validConfig, testFramework());
        sut.validate();
        expect(exitStub).not.called;
        expect(log.fatal).not.called;
      });

      it('should be invalid with non-string mutator name', () => {
        let brokenConfig = breakConfig(config, 'mutator', {
          name: 0,
          excludedMutations: []
        });
        sut = new ConfigValidator(brokenConfig, testFramework());
        sut.validate();
        expect(exitStub).calledWith(1);
        expect(log.fatal).calledWith('Value "0" is invalid for `mutator.name`. Expected a string');
      });

      it('should be invalid with non-array excluded mutations', () => {
        let brokenConfig = breakConfig(config, 'mutator', {
          name: 'es5',
          excludedMutations: 'BooleanSubstitution'
        });
        sut = new ConfigValidator(brokenConfig, testFramework());
        sut.validate();
        expect(exitStub).calledWith(1);
        expect(log.fatal).calledWith('Value "BooleanSubstitution" is invalid for `mutator.excludedMutations`. Expected an array');
      });

      it('should be invalid with non-string excluded mutation array elements', () => {
        let brokenConfig = breakConfig(config, 'mutator', {
          name: 'es5',
          excludedMutations: ['BooleanSubstitution', 0]
        });
        sut = new ConfigValidator(brokenConfig, testFramework());
        sut.validate();
        expect(exitStub).calledWith(1);
        expect(log.fatal).calledWith('Value "0" is an invalid element of `mutator.excludedMutations`. Expected a string');
      });
    });
  });

  describe('reporter', () => {
    it('should be invalid with non-array reporter', () => {
      let brokenConfig = breakConfig(config, 'reporter', 'stryker-typescript');
      sut = new ConfigValidator(brokenConfig, testFramework());
      sut.validate();
      expect(exitStub).calledWith(1);
      expect(log.fatal).calledWith('Value "stryker-typescript" is invalid for `reporter`. Expected an array');
    });

    it('should be invalid with non-string array elements', () => {
      let brokenConfig = breakConfig(config, 'reporter', [
        'stryker-jest',
        0
      ]);
      sut = new ConfigValidator(brokenConfig, testFramework());
      sut.validate();
      expect(exitStub).calledWith(1);
      expect(log.fatal).calledWith('Value "0" is an invalid element of `reporter`. Expected a string');
    });
  });

  describe('transpilers', () => {
    it('should be invalid with non-array transpilers', () => {
      let brokenConfig = breakConfig(config, 'transpilers', 'stryker-typescript');
      sut = new ConfigValidator(brokenConfig, testFramework());
      sut.validate();
      expect(exitStub).calledWith(1);
      expect(log.fatal).calledWith('Value "stryker-typescript" is invalid for `transpilers`. Expected an array');
    });

    it('should be invalid with non-string array elements', () => {
      let brokenConfig = breakConfig(config, 'transpilers', [
        'stryker-jest',
        0
      ]);
      sut = new ConfigValidator(brokenConfig, testFramework());
      sut.validate();
      expect(exitStub).calledWith(1);
      expect(log.fatal).calledWith('Value "0" is an invalid element of `transpilers`. Expected a string');
    });
  });

  it('should be invalid with invalid coverageAnalysis', () => {
    let brokenConfig = breakConfig(config, 'coverageAnalysis', 'invalid');
    sut = new ConfigValidator(brokenConfig, testFramework());
    sut.validate();
    expect(exitStub).calledWith(1);
    expect(log.fatal).calledWith('Value "invalid" is invalid for `coverageAnalysis`. Expected one of the following: "perTest", "all", "off"');
  });
});
