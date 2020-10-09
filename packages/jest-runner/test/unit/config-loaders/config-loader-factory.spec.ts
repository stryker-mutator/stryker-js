import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import Sinon, * as sinon from 'sinon';
import { commonTokens } from '@stryker-mutator/api/plugin';
import { Config } from '@jest/types';

import CustomJestConfigLoader, * as defaultJestConfigLoader from '../../../src/config-loaders/custom-jest-config-loader';
import ReactScriptsJestConfigLoader, * as reactScriptsJestConfigLoader from '../../../src/config-loaders/react-scripts-jest-config-loader';
import ReactScriptsTSJestConfigLoader, * as reactScriptsTSJestConfigLoader from '../../../src/config-loaders/react-scripts-ts-jest-config-loader';
import { JestRunnerOptionsWithStrykerOptions } from '../../../src/jest-runner-options-with-stryker-options';
import { configLoaderFactory } from '../../../src/config-loaders';

describe(configLoaderFactory.name, () => {
  let customConfigLoaderStub: Sinon.SinonStubbedInstance<CustomJestConfigLoader>;
  let reactScriptsJestConfigLoaderStub: Sinon.SinonStubbedInstance<ReactScriptsJestConfigLoader>;
  let reactScriptsTSJestConfigLoaderStub: Sinon.SinonStubbedInstance<ReactScriptsTSJestConfigLoader>;
  let options: JestRunnerOptionsWithStrykerOptions;

  beforeEach(() => {
    customConfigLoaderStub = sinon.createStubInstance(CustomJestConfigLoader);
    reactScriptsJestConfigLoaderStub = sinon.createStubInstance(ReactScriptsJestConfigLoader);
    reactScriptsTSJestConfigLoaderStub = sinon.createStubInstance(ReactScriptsTSJestConfigLoader);

    sinon.stub(defaultJestConfigLoader, 'default').returns(customConfigLoaderStub);
    sinon.stub(reactScriptsJestConfigLoader, 'default').returns(reactScriptsJestConfigLoaderStub);
    sinon.stub(reactScriptsTSJestConfigLoader, 'default').returns(reactScriptsTSJestConfigLoaderStub);

    const defaultOptions: Partial<Config.InitialOptions> = {
      collectCoverage: true,
      verbose: true,
      bail: false,
      testResultsProcessor: 'someResultProcessor',
    };
    customConfigLoaderStub.loadConfig.returns(defaultOptions);
    reactScriptsJestConfigLoaderStub.loadConfig.returns(defaultOptions);
    reactScriptsTSJestConfigLoaderStub.loadConfig.returns(defaultOptions);

    options = factory.strykerWithPluginOptions({
      jest: {
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

  describe('with "projectType": "create-react-app-ts"', () => {
    beforeEach(() => {
      options.jest.projectType = 'create-react-app-ts';
    });

    it('should create a ReactScriptsTSJestConfigLoader', () => {
      const sut = testInjector.injector.provideValue(commonTokens.options, options).injectFunction(configLoaderFactory);

      expect(sut).eq(reactScriptsTSJestConfigLoaderStub);
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
