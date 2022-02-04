import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { commonTokens } from '@stryker-mutator/api/plugin';

import { CustomJestConfigLoader } from '../../../src/config-loaders/custom-jest-config-loader.js';
import { ReactScriptsJestConfigLoader } from '../../../src/config-loaders/react-scripts-jest-config-loader.js';
import { JestRunnerOptionsWithStrykerOptions } from '../../../src/jest-runner-options-with-stryker-options.js';
import { configLoaderFactory } from '../../../src/config-loaders/index.js';

describe(configLoaderFactory.name, () => {
  let options: JestRunnerOptionsWithStrykerOptions;

  beforeEach(() => {
    options = factory.strykerWithPluginOptions({
      jest: {
        enableBail: true,
        enableFindRelatedTests: true,
        projectType: 'custom',
      },
    });
  });

  it('should call a CustomJestConfigLoader no projectType is defined', () => {
    const sut = testInjector.injector.provideValue(commonTokens.options, options).injectFunction(configLoaderFactory);

    expect(sut).instanceOf(CustomJestConfigLoader);
  });

  describe('with "projectType": "create-react-app"', () => {
    beforeEach(() => {
      options.jest.projectType = 'create-react-app';
    });

    it('should create a ReactScriptsJestConfigLoader', () => {
      const sut = testInjector.injector.provideValue(commonTokens.options, options).injectFunction(configLoaderFactory);

      expect(sut).instanceOf(ReactScriptsJestConfigLoader);
    });

    it('should warn when a configFile is set', () => {
      options.jest.configFile = 'jest.conf.js';

      testInjector.injector.provideValue(commonTokens.options, options).injectFunction(configLoaderFactory);

      expect(testInjector.logger.warn).calledWith(`Config setting "configFile" is not supported for projectType "${options.jest.projectType}"`);
    });
  });
});
