import os = require('os');

import sinon = require('sinon');
import { strykerCoreSchema, StrykerOptions } from '@stryker-mutator/api/core';
import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { OptionsValidator, validateOptions, markUnknownOptions } from '../../../src/config/OptionsValidator';
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
      actValidationErrors('Config option "mutator" has the wrong type. It should be a object, but was a number.');
    });

    it('should report a deprecation warning for "mutator.name"', () => {
      (testInjector.options.mutator as any) = {
        name: 'javascript',
      };
      sut.validate(testInjector.options);
      expect(testInjector.logger.warn).calledWith(
        'DEPRECATED. Use of "mutator.name" has been removed. You can remove "mutator.name" from your config as well'
      );
    });

    it('should report a deprecation warning for mutator as a string', () => {
      (testInjector.options.mutator as any) = 'javascript';
      sut.validate(testInjector.options);
      expect(testInjector.logger.warn).calledWith('DEPRECATED. Use of "mutator" as a string is deprecated. Please use it as an object');
    });
  });

  describe('testFramework', () => {
    it('should report a deprecation warning', () => {
      (testInjector.options as any).testFramework = '';
      sut.validate(testInjector.options);
      expect(testInjector.logger.warn).calledWith('DEPRECATED. Use of "testFramework" has been deprecated. Use "options.buildCommand" instead');
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

  describe('maxConcurrentTestRunners', () => {
    it('should report a deprecation warning', () => {
      testInjector.options.maxConcurrentTestRunners = 8;
      sut.validate(testInjector.options);
      expect(testInjector.logger.warn).calledWith('DEPRECATED. Use of "maxConcurrentTestRunners" is deprecated. Please use "concurrency" instead.');
    });

    it('should not configure "concurrency" if "maxConcurrentTestRunners" is >= cpus-1', () => {
      testInjector.options.maxConcurrentTestRunners = 2;
      sinon.stub(os, 'cpus').returns([0, 1, 2]);
      sut.validate(testInjector.options);
      expect(testInjector.options.concurrency).undefined;
    });

    it('should configure "concurrency" if "maxConcurrentTestRunners" is set with a lower value', () => {
      testInjector.options.maxConcurrentTestRunners = 1;
      sinon.stub(os, 'cpus').returns([0, 1, 2]);
      sut.validate(testInjector.options);
      expect(testInjector.options.concurrency).eq(1);
    });
  });

  describe('transpilers', () => {
    it('should report a deprecation warning', () => {
      (testInjector.options.transpilers as any) = ['stryker-jest'];
      sut.validate(testInjector.options);
      expect(testInjector.logger.warn).calledWith('DEPRECATED. Use of "transpilers" is deprecated. Please remove this option.');
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
    const original = testInjector.options[key];
    if (typeof original === 'object' && !Array.isArray(original)) {
      testInjector.options[key] = { ...original, ...value };
    } else {
      testInjector.options[key] = value;
    }
  }
});

describe(validateOptions.name, () => {
  let optionsValidatorMock: sinon.SinonStubbedInstance<OptionsValidator>;

  beforeEach(() => {
    optionsValidatorMock = sinon.createStubInstance(OptionsValidator);
  });

  it('should validate the options using given optionsValidator', () => {
    const options = { foo: 'bar' };
    const output = validateOptions(options, (optionsValidatorMock as unknown) as OptionsValidator);
    expect(options).deep.eq(output);
    expect(optionsValidatorMock.validate).calledWith(options);
  });
});

describe(markUnknownOptions.name, () => {
  it('should not warn when there are no unknown properties', () => {
    testInjector.options.htmlReporter = {
      baseDir: 'test',
    };
    expect(testInjector.logger.warn).not.called;
  });

  it('should return the options, no matter what', () => {
    testInjector.options['this key does not exist'] = 'foo';
    const output = markUnknownOptions(testInjector.options, strykerCoreSchema, testInjector.logger);
    expect(output).eq(testInjector.options);
  });

  it('should not warn when unknown properties are postfixed with "_comment"', () => {
    testInjector.options['maxConcurrentTestRunners_comment'] = 'Recommended to use half of your cores';
    markUnknownOptions(testInjector.options, strykerCoreSchema, testInjector.logger);
    expect(testInjector.logger.warn).not.called;
  });

  it('should warn about unknown properties', () => {
    testInjector.options['karma'] = {};
    testInjector.options['jest'] = {};
    markUnknownOptions(testInjector.options, strykerCoreSchema, testInjector.logger);
    expect(testInjector.logger.warn).calledThrice;
    expect(testInjector.logger.warn).calledWith('Unknown stryker config option "karma".');
    expect(testInjector.logger.warn).calledWith('Unknown stryker config option "jest".');
    expect(testInjector.logger.warn).calledWithMatch('Possible causes');
  });
  it('should not warn about unknown properties when warnings are disabled', () => {
    testInjector.options['karma'] = {};
    testInjector.options.warnings = factory.warningOptions({ unknownOptions: false });
    markUnknownOptions(testInjector.options, strykerCoreSchema, testInjector.logger);
    expect(testInjector.logger.warn).not.called;
  });
  it('should ignore options added by Stryker itself', () => {
    testInjector.options['set'] = {};
    testInjector.options['configFile'] = {};
    testInjector.options['$schema'] = '';
    markUnknownOptions(testInjector.options, strykerCoreSchema, testInjector.logger);
    expect(testInjector.logger.warn).not.called;
  });
});
