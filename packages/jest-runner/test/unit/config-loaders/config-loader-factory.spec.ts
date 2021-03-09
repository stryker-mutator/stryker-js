import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import { commonTokens } from '@stryker-mutator/api/plugin';
import { Config } from '@jest/types';

import * as customJestConfigLoader from '../../../src/config-loaders/custom-jest-config-loader';
import * as reactScriptsJestConfigLoader from '../../../src/config-loaders/react-scripts-jest-config-loader';
import { JestRunnerOptionsWithStrykerOptions } from '../../../src/jest-runner-options-with-stryker-options';
import { configLoaderFactory } from '../../../src/config-loaders';

describe(configLoaderFactory.name, () => {
  let customConfigLoaderStub: sinon.SinonStubbedInstance<customJestConfigLoader.CustomJestConfigLoader>;
  let reactScriptsJestConfigLoaderStub: sinon.SinonStubbedInstance<reactScriptsJestConfigLoader.ReactScriptsJestConfigLoader>;
  let options: JestRunnerOptionsWithStrykerOptions;

  beforeEach(() => {
    customConfigLoaderStub = sinon.createStubInstance(customJestConfigLoader.CustomJestConfigLoader);
    reactScriptsJestConfigLoaderStub = sinon.createStubInstance(reactScriptsJestConfigLoader.ReactScriptsJestConfigLoader);

    sinon.stub(customJestConfigLoader, 'CustomJestConfigLoader').returns(customConfigLoaderStub);
    sinon.stub(reactScriptsJestConfigLoader, 'ReactScriptsJestConfigLoader').returns(reactScriptsJestConfigLoaderStub);

    const defaultOptions: Partial<Config.InitialOptions> = {
      collectCoverage: true,
      verbose: true,
      bail: false,
      testResultsProcessor: 'someResultProcessor',
    };
    customConfigLoaderStub.loadConfig.returns(defaultOptions);
    reactScriptsJestConfigLoaderStub.loadConfig.returns(defaultOptions);

    options = factory.strykerWithPluginOptions({
      jest: {
        enableBail: true,
        enableFindRelatedTests: true,
        projectType: 'custom',
      },
    });
  });

  it('should call the defaultConfigLoader loadConfig method when no projectType is defined', () => {
    const sut = testInjector.injector.provideValue(commonTokens.options, options).injectFunction(configLoaderFactory);

    expect(sut).eq(customConfigLoaderStub);
  });

  describe('with "projectType": "create-react-app"', () => {
    beforeEach(() => {
      options.jest.projectType = 'create-react-app';
    });

    it('should create a ReactScriptsJestConfigLoader', () => {
      const sut = testInjector.injector.provideValue(commonTokens.options, options).injectFunction(configLoaderFactory);

      expect(sut).eq(reactScriptsJestConfigLoaderStub);
    });

    it('should warn when a configFile is set', () => {
      testConfigFileWarning(options);
    });
  });
});

function testConfigFileWarning(options: JestRunnerOptionsWithStrykerOptions) {
  options.jest.configFile = 'jest.conf.js';

  testInjector.injector.provideValue(commonTokens.options, options).injectFunction(configLoaderFactory);

  expect(testInjector.logger.warn).calledWith(`Config setting "configFile" is not supported for projectType "${options.jest.projectType}"`);
}
