import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import Sinon, * as sinon from 'sinon';
import { commonTokens } from '@stryker-mutator/api/plugin';

import CustomJestConfigLoader, * as defaultJestConfigLoader from '../../../src/configLoaders/CustomJestConfigLoader';
import ReactScriptsJestConfigLoader, * as reactScriptsJestConfigLoader from '../../../src/configLoaders/ReactScriptsJestConfigLoader';
import ReactScriptsTSJestConfigLoader, * as reactScriptsTSJestConfigLoader from '../../../src/configLoaders/ReactScriptsTSJestConfigLoader';
import { JestRunnerOptionsWithStrykerOptions } from '../../../src/JestRunnerOptionsWithStrykerOptions';
import { configLoaderFactory } from '../../../src/configLoaders';

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

    const defaultOptions: Partial<Jest.Configuration> = {
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

  describe('with "projectType": "react"', () => {
    beforeEach(() => {
      options.jest.projectType = 'react';
    });

    it('should create a ReactScriptsJestConfigLoader', () => {
      const sut = testInjector.injector.provideValue(commonTokens.options, options).injectFunction(configLoaderFactory);

      expect(sut).eq(reactScriptsJestConfigLoaderStub);
    });

    it('should warn when a configFile is set', () => {
      testConfigFileWarning(options);
    });

    it('should log a deprecation warning', () => {
      testInjector.injector.provideValue(commonTokens.options, options).injectFunction(configLoaderFactory);

      expect(testInjector.logger.warn).calledWith(
        'DEPRECATED: The projectType "react" is deprecated. Use projectType "create-react-app" for react projects created by "create-react-app" or use "custom" for other react projects.'
      );
    });
  });

  describe('with "projectType": "react-ts"', () => {
    beforeEach(() => {
      options.jest.projectType = 'react-ts';
    });

    it('should create a ReactScriptsTSJestConfigLoader', () => {
      const sut = testInjector.injector.provideValue(commonTokens.options, options).injectFunction(configLoaderFactory);

      expect(sut).eq(reactScriptsTSJestConfigLoaderStub);
    });

    it('should warn when a configFile is set', () => {
      testConfigFileWarning(options);
    });

    it('should log a deprecation warning', () => {
      testInjector.injector.provideValue(commonTokens.options, options).injectFunction(configLoaderFactory);

      expect(testInjector.logger.warn).calledWith(
        'DEPRECATED: The projectType "react-ts" is deprecated. Use projectType "create-react-app-ts" for react projects created by "create-react-app" or use "custom" for other react projects.'
      );
    });
  });
});

function testConfigFileWarning(options: JestRunnerOptionsWithStrykerOptions) {
  options.jest.configFile = 'jest.conf.js';

  testInjector.injector.provideValue(commonTokens.options, options).injectFunction(configLoaderFactory);

  expect(testInjector.logger.warn).calledWith(`Config setting "configFile" is not supported for projectType "${options.jest.projectType}"`);
}
