import { expect } from 'chai';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { strykerCoreSchema } from '@stryker-mutator/api/core';

import { markOptions } from '../../../src/config/options-marker';

describe(markOptions.name, () => {
  describe('unknown options', () => {
    it('should not warn when there are no unknown properties', () => {
      testInjector.options.htmlReporter = {
        baseDir: 'test',
      };
      expect(testInjector.logger.warn).not.called;
    });

    it('should return the options, no matter what', () => {
      testInjector.options['this key does not exist'] = 'foo';
      const output = markOptions(testInjector.options, strykerCoreSchema, testInjector.logger);
      expect(output).eq(testInjector.options);
    });

    it('should not warn when unknown properties are postfixed with "_comment"', () => {
      testInjector.options.maxConcurrentTestRunners_comment = 'Recommended to use half of your cores';
      markOptions(testInjector.options, strykerCoreSchema, testInjector.logger);
      expect(testInjector.logger.warn).not.called;
    });

    it('should warn about unknown properties', () => {
      testInjector.options.karma = {};
      testInjector.options.jest = {};
      markOptions(testInjector.options, strykerCoreSchema, testInjector.logger);
      expect(testInjector.logger.warn).calledThrice;
      expect(testInjector.logger.warn).calledWith('Unknown stryker config option "karma".');
      expect(testInjector.logger.warn).calledWith('Unknown stryker config option "jest".');
      expect(testInjector.logger.warn).calledWithMatch('Possible causes');
    });
    it('should not warn about unknown properties when warnings are disabled', () => {
      testInjector.options.karma = {};
      testInjector.options.warnings = factory.warningOptions({ unknownOptions: false });
      markOptions(testInjector.options, strykerCoreSchema, testInjector.logger);
      expect(testInjector.logger.warn).not.called;
    });
    it('should ignore options added by Stryker itself', () => {
      testInjector.options.set = {};
      testInjector.options.configFile = {};
      testInjector.options.$schema = '';
      markOptions(testInjector.options, strykerCoreSchema, testInjector.logger);
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
      markOptions(testInjector.options, strykerCoreSchema, testInjector.logger);
      expect(testInjector.logger.warn).calledWith(
        'Config option "karma.config.webpack.transformPath" is not (fully) serializable. Primitive type "function" has no JSON representation. Any test runner or checker worker processes might not receive this value as intended.'
      );
    });
    it('should not warn about unserializable values when the warning is disabled', () => {
      testInjector.options.warnings = factory.warningOptions({ unserializableOptions: false, unknownOptions: false });
      testInjector.options.myCustomReporter = {
        filter: /some-regex/,
      };
      markOptions(testInjector.options, strykerCoreSchema, testInjector.logger);
      expect(testInjector.logger.warn).not.called;
    });

    it('should hint to disable the warning', () => {
      testInjector.options.myCustomReporter = {
        filter: /some-regex/,
      };
      markOptions(testInjector.options, strykerCoreSchema, testInjector.logger);
      expect(testInjector.logger.warn).calledWith('(disable warnings.unserializableOptions to ignore this warning)');
    });
  });
});
