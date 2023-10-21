import os from 'os';
import path from 'path';

import sinon from 'sinon';
import { LogLevel, ReportType, strykerCoreSchema, StrykerOptions } from '@stryker-mutator/api/core';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { OptionsValidator } from '../../../src/config/options-validator.js';
import { coreTokens } from '../../../src/di/index.js';
import { createCpuInfo } from '../../helpers/producers.js';
import { optionsPath } from '../../../src/utils/index.js';

describe(OptionsValidator.name, () => {
  let sut: OptionsValidator;
  beforeEach(() => {
    sut = testInjector.injector.provideValue(coreTokens.validationSchema, strykerCoreSchema).injectClass(OptionsValidator);
  });

  describe('without options', () => {
    it('should validate an empty object', () => {
      sut.validate({});
      expect(testInjector.logger.fatal).not.called;
      expect(testInjector.logger.error).not.called;
      expect(testInjector.logger.warn).not.called;
    });

    it('should fill default values', () => {
      const options: Record<string, unknown> = {};
      sut.validate(options);
      const expectedOptions: StrykerOptions = {
        allowConsoleColors: true,
        allowEmpty: false,
        appendPlugins: [],
        checkers: [],
        cleanTempDir: true,
        inPlace: false,
        ignorePatterns: [],
        ignoreStatic: false,
        incremental: false,
        incrementalFile: 'reports/stryker-incremental.json',
        force: false,
        checkerNodeArgs: [],
        clearTextReporter: {
          allowColor: true,
          allowEmojis: false,
          logTests: true,
          maxTestsToLog: 3,
          reportTests: true,
          reportMutants: true,
          reportScoreTable: true,
        },
        commandRunner: {
          command: 'npm test',
        },
        coverageAnalysis: 'perTest',
        dashboard: {
          baseUrl: 'https://dashboard.stryker-mutator.io/api/reports',
          reportType: ReportType.Full,
        },
        disableTypeChecks: true,
        dryRunOnly: false,
        dryRunTimeoutMinutes: 5,
        eventReporter: {
          baseDir: 'reports/mutation/events',
        },
        fileLogLevel: LogLevel.Off,
        jsonReporter: {
          fileName: 'reports/mutation/mutation.json',
        },
        htmlReporter: {
          fileName: 'reports/mutation/mutation.html',
        },
        logLevel: LogLevel.Information,
        maxConcurrentTestRunners: 9007199254740991,
        maxTestRunnerReuse: 0,
        mutate: [
          '{src,lib}/**/!(*.+(s|S)pec|*.+(t|T)est).+(cjs|mjs|js|ts|jsx|tsx|html|vue|svelte)',
          '!{src,lib}/**/__tests__/**/*.+(cjs|mjs|js|ts|jsx|tsx|html|vue|svelte)',
        ],
        mutator: {
          excludedMutations: [],
          plugins: null,
        },
        plugins: ['@stryker-mutator/*'],
        reporters: ['clear-text', 'progress', 'html'],
        symlinkNodeModules: true,
        tempDirName: '.stryker-tmp',
        testRunner: 'command',
        testRunnerNodeArgs: [],
        thresholds: {
          break: null,
          high: 80,
          low: 60,
        },
        timeoutFactor: 1.5,
        timeoutMS: 5000,
        tsconfigFile: 'tsconfig.json',
        warnings: true,
        disableBail: false,
        ignorers: [],
      };
      expect(options).deep.eq(expectedOptions);
    });

    it('should validate the default options', () => {
      actAssertValid();
    });
  });

  describe('files', () => {
    it('should log a deprecation warning when "files" are set', () => {
      testInjector.options.files = ['src/**/*.js', '!src/index.js'];
      sut.validate(testInjector.options);
      expect(testInjector.logger.warn).calledWith(
        'DEPRECATED. Use of "files" is deprecated, please use "ignorePatterns" instead (or remove "files" altogether will probably work as well). For now, rewriting them as ["**","!src/**/*.js","src/index.js"]. See https://stryker-mutator.io/docs/stryker-js/configuration/#ignorepatterns-string',
      );
    });

    it(`should rewrite them to "${optionsPath('ignorePatterns')}"`, () => {
      testInjector.options.files = ['src/**/*.js', '!src/index.js'];
      sut.validate(testInjector.options);
      expect(testInjector.options.ignorePatterns).deep.eq(['**', '!src/**/*.js', 'src/index.js']);
    });

    it(`should not clear existing "${optionsPath('ignorePatterns')}" when rewritting "files"`, () => {
      testInjector.options.files = ['src/**/*.js'];
      testInjector.options.ignorePatterns = ['src/index.js'];
      sut.validate(testInjector.options);
      expect(testInjector.options.ignorePatterns).deep.eq(['**', '!src/**/*.js', 'src/index.js']);
    });
  });

  describe('thresholds', () => {
    it('should be invalid with thresholds < 0 or > 100', () => {
      testInjector.options.thresholds.high = -1;
      testInjector.options.thresholds.low = 101;
      actValidationErrors('Config option "thresholds.high" must be >= 0, was -1.', 'Config option "thresholds.low" must be <= 100, was 101.');
    });

    it('should be invalid with thresholds.high null', () => {
      // @ts-expect-error invalid setting
      testInjector.options.thresholds.high = null;
      actValidationErrors('Config option "thresholds.high" has the wrong type. It should be a number, but was a null.');
    });

    it('should not allow high < low', () => {
      testInjector.options.thresholds.high = 20;
      testInjector.options.thresholds.low = 21;
      actValidationErrors('Config option "thresholds.high" should be higher than "thresholds.low".');
    });
  });

  it('should be invalid with invalid logLevel', () => {
    // @ts-expect-error invalid setting
    testInjector.options.logLevel = 'thisTestPasses';
    actValidationErrors(
      'Config option "logLevel" should be one of the allowed values ("off", "fatal", "error", "warn", "info", "debug", "trace"), but was "thisTestPasses".',
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

  it('should be invalid with non-numeric dryRunTimeout', () => {
    breakConfig('dryRunTimeoutMinutes', 'break');
    actValidationErrors('Config option "dryRunTimeoutMinutes" has the wrong type. It should be a number, but was a string.');
  });

  it('should be invalid with negative numeric dryRunTimeout', () => {
    breakConfig('dryRunTimeoutMinutes', -1);
    actValidationErrors('Config option "dryRunTimeoutMinutes" must be >= 0, was -1.');
  });

  it('should report a deprecation warning and set disableBail for jest.enableBail', () => {
    testInjector.options.jest = { enableBail: false };
    sut.validate(testInjector.options);
    expect(testInjector.logger.warn).calledWith(
      'DEPRECATED. Use of "jest.enableBail" is deprecated, please use "disableBail" instead. See https://stryker-mutator.io/docs/stryker-js/configuration#disablebail-boolean',
    );
    expect(testInjector.options.disableBail).true;
  });

  describe('htmlReporter.baseDir', () => {
    it('should report a deprecation warning and set fileName', () => {
      breakConfig('htmlReporter', { baseDir: 'some/base/dir' }, false);
      sut.validate(testInjector.options);
      expect(testInjector.logger.warn).calledWith(
        'DEPRECATED. Use of "htmlReporter.baseDir" is deprecated, please use "htmlReporter.fileName" instead. See https://stryker-mutator.io/docs/stryker-js/configuration/#reporters-string',
      );
      expect(testInjector.options.htmlReporter.fileName).eq(path.join('some', 'base', 'dir', 'index.html'));
    });

    it('should not override the fileName if a fileName is already set', () => {
      breakConfig('htmlReporter', { baseDir: 'some/base/dir', fileName: 'some-other.file.html' });
      sut.validate(testInjector.options);
      expect(testInjector.options.htmlReporter.fileName).eq('some-other.file.html');
    });
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

  describe('appendPlugins', () => {
    it('should be invalid with non-array plugins', () => {
      breakConfig('appendPlugins', '@stryker-mutator/typescript');
      actValidationErrors('Config option "appendPlugins" has the wrong type. It should be a array, but was a string.');
    });

    it('should be invalid with non-string array elements', () => {
      breakConfig('appendPlugins', ['stryker-jest', 0]);
      actValidationErrors('Config option "appendPlugins[1]" has the wrong type. It should be a string, but was a number.');
    });
  });

  describe('mutator', () => {
    it('should be invalid with non-string mutator', () => {
      // @ts-expect-error invalid setting
      testInjector.options.mutator = 1;
      actValidationErrors('Config option "mutator" has the wrong type. It should be a object, but was a number.');
    });

    it('should report a deprecation warning for "mutator.name"', () => {
      testInjector.options.mutator = {
        // @ts-expect-error invalid setting
        name: 'javascript',
      };
      sut.validate(testInjector.options);
      expect(testInjector.logger.warn).calledWith(
        'DEPRECATED. Use of "mutator.name" is no longer needed. You can remove "mutator.name" from your configuration. Stryker now supports mutating of JavaScript and friend files out of the box.',
      );
    });

    it('should report a deprecation warning for mutator as a string', () => {
      // @ts-expect-error invalid setting
      testInjector.options.mutator = 'javascript';
      sut.validate(testInjector.options);
      expect(testInjector.logger.warn).calledWith(
        'DEPRECATED. Use of "mutator" as string is no longer needed. You can remove it from your configuration. Stryker now supports mutating of JavaScript and friend files out of the box.',
      );
    });

    it('should accept mutationRange without a glob pattern', () => {
      testInjector.options.mutate = ['src/index.ts:1:0-2:0'];
      actAssertValid();
    });

    it('should not accept mutationRange for line < 1 (lines are 1 based)', () => {
      testInjector.options.mutate = ['src/app.ts:5:0-6:0', 'src/index.ts:0:0-2:0'];
      actValidationErrors('Config option "mutate[1]" is invalid. Mutation range "0:0-2:0" is invalid, line 0 does not exist (lines start at 1).');
    });

    it('should not accept mutationRange for start > end', () => {
      testInjector.options.mutate = ['src/index.ts:6-5'];
      actValidationErrors(
        'Config option "mutate[0]" is invalid. Mutation range "6-5" is invalid. The "from" line number (6) should be less then the "to" line number (5).',
      );
    });

    it('should not accept mutationRange with a glob pattern', () => {
      testInjector.options.mutate = ['src/index.*.ts:1:0-2:0'];
      actValidationErrors(
        'Config option "mutate[0]" is invalid. Cannot combine a glob expression with a mutation range in "src/index.*.ts:1:0-2:0".',
      );
    });

    it('should not accept mutationRange (with no column numbers) with a glob pattern', () => {
      testInjector.options.mutate = ['src/index.*.ts:1-2'];
      actValidationErrors('Config option "mutate[0]" is invalid. Cannot combine a glob expression with a mutation range in "src/index.*.ts:1-2".');
    });
  });

  describe('testFramework', () => {
    it('should report a deprecation warning', () => {
      testInjector.options.testFramework = '';
      sut.validate(testInjector.options);
      expect(testInjector.logger.warn).calledWith(
        'DEPRECATED. Use of "testFramework" is no longer needed. You can remove it from your configuration. Your test runner plugin now handles its own test framework integration.',
      );
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
      sinon.stub(os, 'cpus').returns([createCpuInfo(), createCpuInfo(), createCpuInfo()]);
      sut.validate(testInjector.options);
      expect(testInjector.options.concurrency).undefined;
    });

    it('should configure "concurrency" if "maxConcurrentTestRunners" is set with a lower value', () => {
      testInjector.options.maxConcurrentTestRunners = 1;
      sinon.stub(os, 'cpus').returns([createCpuInfo(), createCpuInfo(), createCpuInfo()]);
      sut.validate(testInjector.options);
      expect(testInjector.options.concurrency).eq(1);
    });
  });

  it('should be invalid with non-numeric maxTestRunnerReuse', () => {
    breakConfig('maxTestRunnerReuse', 'break');
    actValidationErrors('Config option "maxTestRunnerReuse" has the wrong type. It should be a number, but was a string.');
  });

  it('should warn when testRunnerNodeArgs are combined with the "command" test runner', () => {
    testInjector.options.testRunnerNodeArgs = ['--inspect-brk'];
    testInjector.options.testRunner = 'command';
    sut.validate(testInjector.options);
    expect(testInjector.logger.warn).calledWith(
      'Using "testRunnerNodeArgs" together with the "command" test runner is not supported, these arguments will be ignored. You can add your custom arguments by setting the "commandRunner.command" option.',
    );
  });

  it('should be invalid when combining --ignoreStatic with something else then "perTest" coverage analysis', () => {
    testInjector.options.ignoreStatic = true;
    testInjector.options.coverageAnalysis = 'all';
    actValidationErrors(
      'Config option "ignoreStatic" is not supported with coverage analysis "all". Either turn off "ignoreStatic", or configure "coverageAnalysis" to be "perTest".',
    );
  });

  describe('transpilers', () => {
    it('should report a deprecation warning', () => {
      testInjector.options.transpilers = ['stryker-jest'];
      sut.validate(testInjector.options);
      expect(testInjector.logger.warn).calledWith(
        'DEPRECATED. Support for "transpilers" is removed. You can now configure your own "buildCommand". For example, npm run build.',
      );
    });
  });

  it('should be invalid with invalid coverageAnalysis', () => {
    breakConfig('coverageAnalysis', 'invalid');
    actValidationErrors('Config option "coverageAnalysis" should be one of the allowed values ("off", "all", "perTest"), but was "invalid".');
  });

  describe('unknown options', () => {
    it('should not warn when there are no unknown properties', () => {
      testInjector.options.htmlReporter = {
        fileName: 'test.html',
      };
      sut.validate(testInjector.options, true);
      expect(testInjector.logger.warn).not.called;
    });

    it('should not warn when unknown properties are postfixed with "_comment"', () => {
      testInjector.options.maxConcurrentTestRunners_comment = 'Recommended to use half of your cores';
      sut.validate(testInjector.options, true);
      expect(testInjector.logger.warn).not.called;
    });

    it('should warn about unknown properties', () => {
      testInjector.options.karma = {};
      testInjector.options.jest = {};
      sut.validate(testInjector.options, true);
      expect(testInjector.logger.warn).calledThrice;
      expect(testInjector.logger.warn).calledWith('Unknown stryker config option "karma".');
      expect(testInjector.logger.warn).calledWith('Unknown stryker config option "jest".');
      expect(testInjector.logger.warn).calledWithMatch('Possible causes');
    });

    it('should not warn about unknown options when mark = false', () => {
      testInjector.options.jest = {};
      sut.validate(testInjector.options, false);
      expect(testInjector.logger.warn).not.called;
    });

    it('should not warn about unknown properties when warnings are disabled', () => {
      testInjector.options.karma = {};
      testInjector.options.warnings = factory.warningOptions({ unknownOptions: false });
      sut.validate(testInjector.options, true);
      expect(testInjector.logger.warn).not.called;
    });
    it('should ignore options added by Stryker itself', () => {
      testInjector.options.set = {};
      testInjector.options.configFile = {};
      testInjector.options.$schema = '';
      sut.validate(testInjector.options, true);
      expect(testInjector.logger.warn).not.called;
    });
  });

  describe('unserializable values', () => {
    it('should warn about unserializable values', () => {
      testInjector.options.karma = {
        config: {
          webpack: {
            transformPath() {
              /* idle */
            },
          },
        },
      };
      sut.validate(testInjector.options, true);
      expect(testInjector.logger.warn).calledWith(
        'Config option "karma.config.webpack.transformPath" is not (fully) serializable. Primitive type "function" has no JSON representation. Any test runner or checker worker processes might not receive this value as intended.',
      );
    });
    it('should not warn about unserializable values when the warning is disabled', () => {
      testInjector.options.warnings = factory.warningOptions({ unserializableOptions: false, unknownOptions: false });
      testInjector.options.myCustomReporter = {
        filter: /some-regex/,
      };
      sut.validate(testInjector.options, true);
      expect(testInjector.logger.warn).not.called;
    });

    it('should hint to disable the warning', () => {
      testInjector.options.myCustomReporter = {
        filter: /some-regex/,
      };
      sut.validate(testInjector.options, true);
      expect(testInjector.logger.warn).calledWith('(disable warnings.unserializableOptions to ignore this warning)');
    });
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

  function breakConfig(key: keyof StrykerOptions, value: any, mergeObjects = true): void {
    const original = testInjector.options[key];
    if (typeof original === 'object' && !Array.isArray(original) && mergeObjects) {
      testInjector.options[key] = { ...original, ...value };
    } else {
      testInjector.options[key] = value;
    }
  }
});
