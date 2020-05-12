import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { assert, expect } from 'chai';
import * as sinon from 'sinon';

import CustomJestConfigLoader, * as defaultJestConfigLoader from '../../../src/configLoaders/CustomJestConfigLoader';
import ReactScriptsJestConfigLoader, * as reactScriptsJestConfigLoader from '../../../src/configLoaders/ReactScriptsJestConfigLoader';
import ReactScriptsTSJestConfigLoader, * as reactScriptsTSJestConfigLoader from '../../../src/configLoaders/ReactScriptsTSJestConfigLoader';
import { JestRunnerOptionsWithStrykerOptions } from '../../../src/JestRunnerOptionsWithStrykerOptions';
import { configLoaderFactory } from '../../../src/configLoaders';

describe(configLoaderFactory.name, () => {
  let customConfigLoaderStub: ConfigLoaderStub;
  let reactScriptsJestConfigLoaderStub: ConfigLoaderStub;
  let reactScriptsTSJestConfigLoaderStub: ConfigLoaderStub;
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
    const sut = testInjector.injector.injectFunction(configLoaderFactory);

    assert(sut instanceof CustomJestConfigLoader);
  });

  describe('with "projectType": "react"', () => {
    beforeEach(() => {
      options.jest.projectType = 'react';
    });

    it('should create a ReactScriptsJestConfigLoader', () => {
      const sut = testInjector.injector.injectFunction(configLoaderFactory);

      assert(sut instanceof ReactScriptsJestConfigLoader);
    });

    it('should warn when a configFile is set', () => {
      testConfigFileWarning(options);
    });
  });

  describe('with "projectType": "react-ts"', () => {
    beforeEach(() => {
      options.jest.projectType = 'react-ts';
    });

    it('should create a ReactScriptsTSJestConfigLoader', () => {
      const sut = testInjector.injector.injectFunction(configLoaderFactory);

      assert(sut instanceof ReactScriptsTSJestConfigLoader);
    });

    it('should warn when a configFile is set', () => {
      testConfigFileWarning(options);
    });
  });
});

interface ConfigLoaderStub {
  loadConfig: sinon.SinonStub;
}

function testConfigFileWarning(options: JestRunnerOptionsWithStrykerOptions) {
  options.jest.configFile = 'jest.conf.js';

  testInjector.injector.injectFunction(configLoaderFactory);

  assert(testInjector.logger.warn.calledWith, `Config setting "configFile" is not supported for projectType "${options.jest.projectType}"`);
}
