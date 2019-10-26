import { StrykerOptions } from '@stryker-mutator/api/core';
import { TestFramework } from '@stryker-mutator/api/test_framework';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import ConfigValidator from '../../../src/config/ConfigValidator';
import { coreTokens } from '../../../src/di';

describe(ConfigValidator.name, () => {
  let sut: ConfigValidator;

  function breakConfig(key: keyof StrykerOptions, value: any): void {
    if (typeof testInjector.options[key] === 'object' && !Array.isArray(testInjector.options[key])) {
      testInjector.options[key] = { ...testInjector.options[key], ...value };
    } else {
      testInjector.options[key] = value;
    }
  }

  function createSut(testFramework: TestFramework | null = factory.testFramework()) {
    return testInjector.injector.provideValue(coreTokens.testFramework, testFramework).injectClass(ConfigValidator);
  }

  beforeEach(() => {
    sut = createSut();
  });

  it('should validate with default config', () => {
    sut.validate();
    expect(testInjector.logger.fatal).not.called;
    expect(testInjector.logger.error).not.called;
    expect(testInjector.logger.warn).not.called;
  });

  it('should be invalid with coverageAnalysis "perTest" without a testFramework', () => {
    testInjector.options.coverageAnalysis = 'perTest';
    sut = createSut(null);
    actValidationError();
    expect(testInjector.logger.fatal).calledWith(
      'Configured coverage analysis "perTest" requires there to be a testFramework configured. Either configure a testFramework or set coverageAnalysis to "all" or "off".'
    );
  });

  describe('thresholds', () => {
    it('should be invalid with thresholds < 0 or > 100', () => {
      testInjector.options.thresholds.high = -1;
      testInjector.options.thresholds.low = 101;
      actValidationError();
      expect(testInjector.logger.fatal).calledWith('`thresholds.high` is lower than `thresholds.low` (-1 < 101)');
      expect(testInjector.logger.fatal).calledWith('Value -1 is invalid for `thresholds.high`. Expected a number between 0 and 100');
      expect(testInjector.logger.fatal).calledWith('Value 101 is invalid for `thresholds.low`. Expected a number between 0 and 100');
    });

    it('should be invalid with thresholds.high null', () => {
      (testInjector.options.thresholds.high as any) = null;
      testInjector.options.thresholds.low = 101;
      actValidationError();
      expect(testInjector.logger.fatal).calledWith('Value null is invalid for `thresholds.high`. Expected a number between 0 and 100');
    });
  });

  it('should be invalid with coverageAnalysis when 2 transpilers are specified (for now)', () => {
    testInjector.options.transpilers.push('a transpiler');
    testInjector.options.transpilers.push('a second transpiler');
    testInjector.options.coverageAnalysis = 'all';
    actValidationError();
    expect(testInjector.logger.fatal).calledWith(
      'Value "all" for `coverageAnalysis` is invalid with multiple transpilers' +
        ' (configured transpilers: a transpiler, a second transpiler). Please report this to the Stryker team' +
        ' if you whish this feature to be implemented'
    );
  });

  it('should be invalid with invalid logLevel', () => {
    testInjector.options.logLevel = 'thisTestPasses' as any;
    actValidationError();
    expect(testInjector.logger.fatal).calledWith(
      'Value "thisTestPasses" is invalid for `logLevel`. Expected one of the following: "fatal", "error", "warn", "info", "debug", "trace", "off"'
    );
  });

  it('should be invalid with nonnumeric timeoutMS', () => {
    breakConfig('timeoutMS', 'break');
    actValidationError();
    expect(testInjector.logger.fatal).calledWith('Value "break" is invalid for `timeoutMS`. Expected a number');
  });

  it('should be invalid with nonnumeric timeoutMS (NaN)', () => {
    breakConfig('timeoutMS', NaN);
    actValidationError();
    expect(testInjector.logger.fatal).calledWith('Value NaN is invalid for `timeoutMS`. Expected a number');
  });

  it('should be invalid with nonnumeric timeoutFactor', () => {
    breakConfig('timeoutFactor', 'break');
    actValidationError();
    expect(testInjector.logger.fatal).calledWith('Value "break" is invalid for `timeoutFactor`. Expected a number');
  });

  describe('plugins', () => {
    it('should be invalid with non-array plugins', () => {
      breakConfig('plugins', '@stryker-mutator/typescript');
      actValidationError();
      expect(testInjector.logger.fatal).calledWith('Value "@stryker-mutator/typescript" is invalid for `plugins`. Expected an array');
    });

    it('should be invalid with non-string array elements', () => {
      breakConfig('plugins', ['stryker-jest', 0]);
      actValidationError();
      expect(testInjector.logger.fatal).calledWith('Value 0 is an invalid element of `plugins`. Expected a string');
    });
  });

  describe('mutator', () => {
    it('should be invalid with non-string mutator', () => {
      breakConfig('mutator', 0);
      actValidationError();
      expect(testInjector.logger.fatal).calledWith('Value 0 is invalid for `mutator`. Expected either a string or an object');
    });

    describe('as an object', () => {
      it('should be valid with string mutator name and string array excluded mutations', () => {
        breakConfig('mutator', {
          excludedMutations: ['BooleanSubstitution'],
          name: 'javascript'
        });
        sut.validate();
        expect(testInjector.logger.fatal).not.called;
      });

      it('should be invalid with non-string mutator name', () => {
        breakConfig('mutator', {
          excludedMutations: [],
          name: 0
        });
        actValidationError();
        expect(testInjector.logger.fatal).calledWith('Value 0 is invalid for `mutator.name`. Expected a string');
      });

      it('should be invalid with non-array excluded mutations', () => {
        breakConfig('mutator', {
          excludedMutations: 'BooleanSubstitution',
          name: 'javascript'
        });
        actValidationError();
        expect(testInjector.logger.fatal).calledWith('Value "BooleanSubstitution" is invalid for `mutator.excludedMutations`. Expected an array');
      });

      it('should be invalid with non-string excluded mutation array elements', () => {
        breakConfig('mutator', {
          excludedMutations: ['BooleanSubstitution', 0],
          name: 'javascript'
        });
        actValidationError();
        expect(testInjector.logger.fatal).calledWith('Value 0 is an invalid element of `mutator.excludedMutations`. Expected a string');
      });
    });
  });

  describe('reporters', () => {
    it('should be invalid with non-array reporters', () => {
      breakConfig('reporters', '@stryker-mutator/typescript');
      actValidationError();
      expect(testInjector.logger.fatal).calledWith('Value "@stryker-mutator/typescript" is invalid for `reporters`. Expected an array');
    });

    it('should be invalid with non-string array elements', () => {
      breakConfig('reporters', ['stryker-jest', 0]);
      actValidationError();
      expect(testInjector.logger.fatal).calledWith('Value 0 is an invalid element of `reporters`. Expected a string');
    });
  });

  describe('dashboard', () => {
    it('should be invalid for non-string project', () => {
      breakConfig('dashboard', { project: 23 });
      actValidationError();
      expect(testInjector.logger.fatal).calledWith('Value 23 is invalid for `dashboard.project`. Expected a string');
    });
    it('should be invalid for non-string module', () => {
      breakConfig('dashboard', { module: 23 });
      actValidationError();
      expect(testInjector.logger.fatal).calledWith('Value 23 is invalid for `dashboard.module`. Expected a string');
    });
    it('should be invalid for non-string version', () => {
      breakConfig('dashboard', { version: 23 });
      actValidationError();
      expect(testInjector.logger.fatal).calledWith('Value 23 is invalid for `dashboard.version`. Expected a string');
    });
    it('should be invalid for non-string baseUrl', () => {
      breakConfig('dashboard', { baseUrl: 23 });
      actValidationError();
      expect(testInjector.logger.fatal).calledWith('Value 23 is invalid for `dashboard.baseUrl`. Expected a string');
    });
  });

  describe('transpilers', () => {
    it('should be invalid with non-array transpilers', () => {
      breakConfig('transpilers', '@stryker-mutator/typescript');
      actValidationError();
      expect(testInjector.logger.fatal).calledWith('Value "@stryker-mutator/typescript" is invalid for `transpilers`. Expected an array');
    });

    it('should be invalid with non-string array elements', () => {
      breakConfig('transpilers', ['stryker-jest', 0]);
      actValidationError();
      expect(testInjector.logger.fatal).calledWith('Value 0 is an invalid element of `transpilers`. Expected a string');
    });
  });

  it('should be invalid with invalid coverageAnalysis', () => {
    breakConfig('coverageAnalysis', 'invalid');
    actValidationError();
    expect(testInjector.logger.fatal).calledWith(
      'Value "invalid" is invalid for `coverageAnalysis`. Expected one of the following: "perTest", "all", "off"'
    );
  });

  function actValidationError() {
    expect(() => sut.validate()).throws('Stryker could not recover from this configuration error, see fatal log message(s) above.');
  }
});
