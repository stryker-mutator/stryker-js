import { expect } from 'chai';
import { Config } from 'stryker-api/config';
import { Logger } from 'stryker-api/logging';
import ConfigValidator from '../../../src/config/ConfigValidator';
import currentLogMock from '../../helpers/logMock';
import { Mock, testFramework } from '../../helpers/producers';

describe('ConfigValidator', () => {

  let config: Config;
  let sut: ConfigValidator;
  let log: Mock<Logger>;

  function breakConfig(oldConfig: Config, key: keyof Config, value: any): any {
    return {...oldConfig,  [key]: value};
  }

  beforeEach(() => {
    log = currentLogMock();
    config = new Config();
  });

  it('should validate with default config', () => {
    sut = new ConfigValidator(config, testFramework());
    sut.validate();
    expect(log.fatal).not.called;
  });

  it('should be invalid with coverageAnalysis "perTest" without a testFramework', () => {
    config.coverageAnalysis = 'perTest';
    sut = new ConfigValidator(config, null);
    actValidationError();
    expect(log.fatal).calledWith('Configured coverage analysis "perTest" requires there to be a testFramework configured. Either configure a testFramework or set coverageAnalysis to "all" or "off".');
  });

  describe('thresholds', () => {

    it('should be invalid with thresholds < 0 or > 100', () => {
      config.thresholds.high = -1;
      config.thresholds.low = 101;
      sut = new ConfigValidator(config, testFramework());
      actValidationError();
      expect(log.fatal).calledWith('`thresholds.high` is lower than `thresholds.low` (-1 < 101)');
      expect(log.fatal).calledWith('Value "-1" is invalid for `thresholds.high`. Expected a number between 0 and 100');
      expect(log.fatal).calledWith('Value "101" is invalid for `thresholds.low`. Expected a number between 0 and 100');
    });

    it('should be invalid with thresholds.high null', () => {
      (config.thresholds.high as any) = null;
      config.thresholds.low = 101;
      sut = new ConfigValidator(config, testFramework());
      actValidationError();
      expect(log.fatal).calledWith('Value "null" is invalid for `thresholds.high`. Expected a number between 0 and 100');
    });
  });

  it('should be invalid with coverageAnalysis when 2 transpilers are specified (for now)', () => {
    config.transpilers.push('a transpiler');
    config.transpilers.push('a second transpiler');
    config.coverageAnalysis = 'all';
    sut = new ConfigValidator(config, testFramework());
    actValidationError();
    expect(log.fatal).calledWith('Value "all" for `coverageAnalysis` is invalid with multiple transpilers' +
      ' (configured transpilers: a transpiler, a second transpiler). Please report this to the Stryker team' +
      ' if you whish this feature to be implemented');
  });

  it('should be invalid with invalid logLevel', () => {
    config.logLevel = 'thisTestPasses' as any;
    sut = new ConfigValidator(config, testFramework());
    actValidationError();
    expect(log.fatal).calledWith('Value "thisTestPasses" is invalid for `logLevel`. Expected one of the following: "fatal", "error", "warn", "info", "debug", "trace", "off"');
  });

  it('should be invalid with nonnumeric timeoutMS', () => {
    const brokenConfig = breakConfig(config, 'timeoutMS', 'break');
    sut = new ConfigValidator(brokenConfig, testFramework());
    actValidationError();
    expect(log.fatal).calledWith('Value "break" is invalid for `timeoutMS`. Expected a number');
  });

  it('should be invalid with nonnumeric timeoutMS (NaN)', () => {
    const brokenConfig = breakConfig(config, 'timeoutMS', NaN);
    sut = new ConfigValidator(brokenConfig, testFramework());
    actValidationError();
    expect(log.fatal).calledWith('Value "NaN" is invalid for `timeoutMS`. Expected a number');
  });

  it('should be invalid with nonnumeric timeoutFactor', () => {
    const brokenConfig = breakConfig(config, 'timeoutFactor', 'break');
    sut = new ConfigValidator(brokenConfig, testFramework());
    actValidationError();
    expect(log.fatal).calledWith('Value "break" is invalid for `timeoutFactor`. Expected a number');
  });

  describe('plugins', () => {
    it('should be invalid with non-array plugins', () => {
      const brokenConfig = breakConfig(config, 'plugins', 'stryker-typescript');
      sut = new ConfigValidator(brokenConfig, testFramework());
      actValidationError();
      expect(log.fatal).calledWith('Value "stryker-typescript" is invalid for `plugins`. Expected an array');
    });

    it('should be invalid with non-string array elements', () => {
      const brokenConfig = breakConfig(config, 'plugins', ['stryker-jest', 0]);
      sut = new ConfigValidator(brokenConfig, testFramework());
      actValidationError();
      expect(log.fatal).calledWith('Value "0" is an invalid element of `plugins`. Expected a string');
    });
  });

  describe('mutator', () => {
    it('should be invalid with non-string mutator', () => {
      const brokenConfig = breakConfig(config, 'mutator', 0);
      sut = new ConfigValidator(brokenConfig, testFramework());
      actValidationError();
      expect(log.fatal).calledWith('Value "0" is invalid for `mutator`. Expected either a string or an object');
    });

    describe('as an object', () => {
      it('should be valid with string mutator name and string array excluded mutations', () => {
        const validConfig = breakConfig(config, 'mutator', {
          excludedMutations: ['BooleanSubstitution'],
          name: 'es5'
        });
        sut = new ConfigValidator(validConfig, testFramework());
        sut.validate();
        expect(log.fatal).not.called;
      });

      it('should be invalid with non-string mutator name', () => {
        const brokenConfig = breakConfig(config, 'mutator', {
          excludedMutations: [],
          name: 0
        });
        sut = new ConfigValidator(brokenConfig, testFramework());
        actValidationError();
        expect(log.fatal).calledWith('Value "0" is invalid for `mutator.name`. Expected a string');
      });

      it('should be invalid with non-array excluded mutations', () => {
        const brokenConfig = breakConfig(config, 'mutator', {
          excludedMutations: 'BooleanSubstitution',
          name: 'es5'
        });
        sut = new ConfigValidator(brokenConfig, testFramework());
        actValidationError();
        expect(log.fatal).calledWith('Value "BooleanSubstitution" is invalid for `mutator.excludedMutations`. Expected an array');
      });

      it('should be invalid with non-string excluded mutation array elements', () => {
        const brokenConfig = breakConfig(config, 'mutator', {
          excludedMutations: ['BooleanSubstitution', 0],
          name: 'es5'
        });
        sut = new ConfigValidator(brokenConfig, testFramework());
        actValidationError();
        expect(log.fatal).calledWith('Value "0" is an invalid element of `mutator.excludedMutations`. Expected a string');
      });
    });
  });

  describe('reporters', () => {
    it('should be invalid with non-array reporters', () => {
      const brokenConfig = breakConfig(config, 'reporters', 'stryker-typescript');
      sut = new ConfigValidator(brokenConfig, testFramework());
      actValidationError();
      expect(log.fatal).calledWith('Value "stryker-typescript" is invalid for `reporters`. Expected an array');
    });

    it('should be invalid with non-string array elements', () => {
      const brokenConfig = breakConfig(config, 'reporters', [
        'stryker-jest',
        0
      ]);
      sut = new ConfigValidator(brokenConfig, testFramework());
      actValidationError();
      expect(log.fatal).calledWith('Value "0" is an invalid element of `reporters`. Expected a string');
    });
  });

  describe('transpilers', () => {
    it('should be invalid with non-array transpilers', () => {
      const brokenConfig = breakConfig(config, 'transpilers', 'stryker-typescript');
      sut = new ConfigValidator(brokenConfig, testFramework());
      actValidationError();
      expect(log.fatal).calledWith('Value "stryker-typescript" is invalid for `transpilers`. Expected an array');
    });

    it('should be invalid with non-string array elements', () => {
      const brokenConfig = breakConfig(config, 'transpilers', [
        'stryker-jest',
        0
      ]);
      sut = new ConfigValidator(brokenConfig, testFramework());
      actValidationError();
      expect(log.fatal).calledWith('Value "0" is an invalid element of `transpilers`. Expected a string');
    });
  });

  it('should be invalid with invalid coverageAnalysis', () => {
    const brokenConfig = breakConfig(config, 'coverageAnalysis', 'invalid');
    sut = new ConfigValidator(brokenConfig, testFramework());
    actValidationError();
    expect(log.fatal).calledWith('Value "invalid" is invalid for `coverageAnalysis`. Expected one of the following: "perTest", "all", "off"');
  });

  function actValidationError() {
    expect(() => sut.validate()).throws('Stryker could not recover from this configuration error, see fatal log message(s) above.');
  }

});
