import { strykerCoreSchema, StrykerOptions } from '@stryker-mutator/api/core';
import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { normalizeWhitespaces } from '@stryker-mutator/util';

import { OptionsValidator } from '../../../src/config/OptionsValidator';
import { coreTokens } from '../../../src/di';

describe(OptionsValidator.name, () => {
  let sut: OptionsValidator;
  beforeEach(() => {
    sut = testInjector.injector.provideValue(coreTokens.validationSchema, strykerCoreSchema).injectClass(OptionsValidator);
  });

  it('should validate an empty object', () => {
    sut.validate({});
    expect(testInjector.logger.fatal).not.called;
    expect(testInjector.logger.error).not.called;
    expect(testInjector.logger.warn).not.called;
  });

  it('should validate the default options', () => {
    actAssertValid();
  });

  describe('thresholds', () => {
    it('should be invalid with thresholds < 0 or > 100', () => {
      testInjector.options.thresholds.high = -1;
      testInjector.options.thresholds.low = 101;
      actValidationErrors('Config option "thresholds.high" should be >= 0, was -1.', 'Config option "thresholds.low" should be <= 100, was 101.');
    });

    it('should be invalid with thresholds.high null', () => {
      (testInjector.options.thresholds.high as any) = null;
      actValidationErrors('Config option "thresholds.high" has the wrong type. It should be a number, but was a null.');
    });

    it('should not allow high < low', () => {
      testInjector.options.thresholds.high = 20;
      testInjector.options.thresholds.low = 21;
      actValidationErrors('Config option "thresholds.high" should be higher than "thresholds.low".');
    });
  });

  it('should be invalid with coverageAnalysis when 2 transpilers are specified (for now)', () => {
    testInjector.options.transpilers.push('a transpiler');
    testInjector.options.transpilers.push('a second transpiler');
    testInjector.options.coverageAnalysis = 'all';
    actValidationErrors(
      normalizeWhitespaces(`
      Config option "coverageAnalysis" is invalid. Coverage analysis "all" is not supported for multiple transpilers
      (configured transpilers: "a transpiler", "a second transpiler").
      Change it to "off". Please report this to the Stryker team if you whish this feature to be implemented.
    `)
    );
  });

  it('should be invalid with invalid logLevel', () => {
    testInjector.options.logLevel = 'thisTestPasses' as any;
    actValidationErrors(
      'Config option "logLevel" should be one of the allowed values ("off", "fatal", "error", "warn", "info", "debug", "trace"), but was "thisTestPasses".'
    );
  });

  it('should be invalid with non-numeric timeoutMS', () => {
    breakConfig('timeoutMS', 'break');
    actValidationErrors('Config option "timeoutMS" has the wrong type. It should be a number, but was a string.');
  });

  it('should be invalid with non-numeric timeoutFactor', () => {
    breakConfig('timeoutFactor', 'break');
    actValidationErrors('Config option "timeoutFactor" has the wrong type. It should be a number, but was a string.');
  });

  describe('plugins', () => {
    it('should be invalid with non-array plugins', () => {
      breakConfig('plugins', '@stryker-mutator/typescript');
      actValidationErrors('Config option "plugins" has the wrong type. It should be a array, but was a string.');
    });

    it('should be invalid with non-string array elements', () => {
      breakConfig('plugins', ['stryker-jest', 0]);
      actValidationErrors('Config option "plugins[1]" has the wrong type. It should be a string, but was a number.');
    });
  });

  describe('mutator', () => {
    it('should be invalid with non-string mutator', () => {
      breakConfig('mutator', 0);
      actValidationErrors('Config option "mutator" has the wrong type. It should be a string or object, but was a number.');
    });

    describe('as an object', () => {
      it('should be valid with all options', () => {
        testInjector.options.mutator = {
          excludedMutations: ['BooleanSubstitution'],
          name: 'javascript',
          plugins: ['objectRestSpread', ['decorators', { decoratorsBeforeExport: true }]]
        };
        actAssertValid();
      });

      it('should be valid with minimal options', () => {
        breakConfig('mutator', {
          name: 'javascript'
        });
        actAssertValid();
      });

      it('should be invalid without name', () => {
        breakConfig('mutator', {});
        actValidationErrors('Config option "mutator" should have required property "name"');
      });

      it('should be invalid with non-string mutator name', () => {
        breakConfig('mutator', {
          name: 0
        });
        actValidationErrors('Config option "mutator.name" has the wrong type. It should be a string, but was a number.');
      });

      it('should be invalid with non array plugins', () => {
        breakConfig('mutator', {
          name: 'javascript',
          plugins: 'optionalChaining'
        });
        actValidationErrors('Config option "mutator.plugins" has the wrong type. It should be a array or null, but was a string.');
      });

      it('should be invalid with non-array excluded mutations', () => {
        breakConfig('mutator', {
          excludedMutations: 'BooleanSubstitution',
          name: 'javascript'
        });
        actValidationErrors('Config option "mutator.excludedMutations" has the wrong type. It should be a array, but was a string.');
      });

      it('should be invalid with non-string excluded mutation array elements', () => {
        breakConfig('mutator', {
          excludedMutations: ['BooleanSubstitution', 0],
          name: 'javascript'
        });
        actValidationErrors('Config option "mutator.excludedMutations[1]" has the wrong type. It should be a string, but was a number.');
      });
    });
  });

  describe('reporters', () => {
    it('should be invalid with non-array reporters', () => {
      breakConfig('reporters', '@stryker-mutator/typescript');
      actValidationErrors('Config option "reporters" has the wrong type. It should be a array, but was a string.');
    });

    it('should be invalid with non-string array elements', () => {
      breakConfig('reporters', ['stryker-jest', 0]);
      actValidationErrors('Config option "reporters[1]" has the wrong type. It should be a string, but was a number.');
    });
  });

  describe('dashboard', () => {
    it('should be invalid for non-string project', () => {
      breakConfig('dashboard', { project: 23 });
      actValidationErrors('Config option "dashboard.project" has the wrong type. It should be a string, but was a number.');
    });
    it('should be invalid for non-string module', () => {
      breakConfig('dashboard', { module: 23 });
      actValidationErrors('Config option "dashboard.module" has the wrong type. It should be a string, but was a number.');
    });
    it('should be invalid for non-string version', () => {
      breakConfig('dashboard', { version: 23 });
      actValidationErrors('Config option "dashboard.version" has the wrong type. It should be a string, but was a number.');
    });
    it('should be invalid for non-string baseUrl', () => {
      breakConfig('dashboard', { baseUrl: 23 });
      actValidationErrors('Config option "dashboard.baseUrl" has the wrong type. It should be a string, but was a number.');
    });
    it('should be invalid for a wrong reportType', () => {
      breakConfig('dashboard', { reportType: 'empty' });
      actValidationErrors('Config option "dashboard.reportType" should be one of the allowed values ("full", "mutationScore"), but was "empty".');
    });
  });

  describe('transpilers', () => {
    it('should be invalid with non-array transpilers', () => {
      breakConfig('transpilers', '@stryker-mutator/typescript');
      actValidationErrors('Config option "transpilers" has the wrong type. It should be a array, but was a string.');
    });

    it('should be invalid with non-string array elements', () => {
      breakConfig('transpilers', ['stryker-jest', 0]);
      actValidationErrors('Config option "transpilers[1]" has the wrong type. It should be a string, but was a number.');
    });
  });

  it('should be invalid with invalid coverageAnalysis', () => {
    breakConfig('coverageAnalysis', 'invalid');
    actValidationErrors('Config option "coverageAnalysis" should be one of the allowed values ("off", "all", "perTest"), but was "invalid".');
  });

  function actValidationErrors(...expectedErrors: string[]) {
    expect(() => sut.validate(testInjector.options)).throws();
    for (const error of expectedErrors) {
      expect(testInjector.logger.error).calledWith(error);
    }
    expect(testInjector.logger.error).callCount(expectedErrors.length);
  }

  function actAssertValid() {
    sut.validate(testInjector.options);
    expect(testInjector.logger.fatal).not.called;
    expect(testInjector.logger.error).not.called;
    expect(testInjector.logger.warn).not.called;
  }

  function breakConfig(key: keyof StrykerOptions, value: any): void {
    if (typeof testInjector.options[key] === 'object' && !Array.isArray(testInjector.options[key])) {
      testInjector.options[key] = { ...testInjector.options[key], ...value };
    } else {
      testInjector.options[key] = value;
    }
  }
});
