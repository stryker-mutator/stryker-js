import { commonTokens } from '@stryker-mutator/api/plugin';
import { Reporter } from '@stryker-mutator/api/report';
import { TestFramework } from '@stryker-mutator/api/test_framework';
import { factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { MutatorDescriptor, StrykerOptions } from '@stryker-mutator/api/core';

import * as configModule from '../../../src/config';
import ConfigReader, * as configReaderModule from '../../../src/config/ConfigReader';
import * as di from '../../../src/di';
import { PluginCreator } from '../../../src/di';
import { buildMainInjector } from '../../../src/di/buildMainInjector';
import * as broadcastReporterModule from '../../../src/reporters/BroadcastReporter';
import TestFrameworkOrchestrator, * as testFrameworkOrchestratorModule from '../../../src/TestFrameworkOrchestrator';
import currentLogMock from '../../helpers/logMock';

describe(buildMainInjector.name, () => {
  let testFrameworkOrchestratorMock: sinon.SinonStubbedInstance<TestFrameworkOrchestrator>;
  let pluginLoaderMock: sinon.SinonStubbedInstance<di.PluginLoader>;
  let testFrameworkMock: TestFramework;
  let configReaderMock: sinon.SinonStubbedInstance<ConfigReader>;
  let pluginCreatorMock: sinon.SinonStubbedInstance<PluginCreator<any>>;
  let buildSchemaWithPluginContributionsStub: sinon.SinonStub;
  let optionsEditorApplierMock: sinon.SinonStubbedInstance<configModule.OptionsEditorApplier>;
  let broadcastReporterMock: sinon.SinonStubbedInstance<Reporter>;
  let optionsValidatorStub: sinon.SinonStubbedInstance<configModule.OptionsValidator>;
  let expectedConfig: StrykerOptions;

  beforeEach(() => {
    configReaderMock = sinon.createStubInstance(ConfigReader);
    pluginCreatorMock = sinon.createStubInstance(PluginCreator);
    pluginCreatorMock = sinon.createStubInstance(PluginCreator);
    optionsEditorApplierMock = sinon.createStubInstance(configModule.OptionsEditorApplier);
    testFrameworkMock = factory.testFramework();
    testFrameworkOrchestratorMock = sinon.createStubInstance(TestFrameworkOrchestrator);
    testFrameworkOrchestratorMock.determineTestFramework.returns(testFrameworkMock);
    pluginLoaderMock = sinon.createStubInstance(di.PluginLoader);
    optionsValidatorStub = sinon.createStubInstance(configModule.OptionsValidator);
    buildSchemaWithPluginContributionsStub = sinon.stub();
    expectedConfig = factory.strykerOptions();
    broadcastReporterMock = factory.reporter('broadcast');
    configReaderMock.readConfig.returns(expectedConfig);
    stubInjectable(PluginCreator, 'createFactory').returns(() => pluginCreatorMock);
    stubInjectable(configModule, 'OptionsEditorApplier').returns(optionsEditorApplierMock);
    stubInjectable(configModule, 'buildSchemaWithPluginContributions').returns(buildSchemaWithPluginContributionsStub);
    stubInjectable(configModule, 'OptionsValidator').returns(optionsValidatorStub);
    stubInjectable(di, 'PluginLoader').returns(pluginLoaderMock);
    stubInjectable(configReaderModule, 'default').returns(configReaderMock);
    stubInjectable(broadcastReporterModule, 'default').returns(broadcastReporterMock);
    stubInjectable(testFrameworkOrchestratorModule, 'default').returns(testFrameworkOrchestratorMock);
  });

  function stubInjectable<T>(obj: T, method: keyof T) {
    const inject = (obj[method] as any).inject;
    const stub = sinon.stub(obj, method);
    (stub as any).inject = inject;
    return stub;
  }

  describe('resolve options', () => {
    it('should supply readonly stryker options', () => {
      const actualOptions = buildMainInjector({}).resolve(commonTokens.options);
      expect(actualOptions).frozen;
    });

    it('should load default plugins', () => {
      buildMainInjector({}).resolve(commonTokens.options);
      expect(di.PluginLoader).calledWithNew;
      expect(di.PluginLoader).calledWith(currentLogMock(), ['@stryker-mutator/*', require.resolve('../../../src/reporters')]);
    });

    it('should load plugins', () => {
      buildMainInjector({}).resolve(commonTokens.options);
      expect(pluginLoaderMock.load).called;
    });

    it('should apply config editors', () => {
      buildMainInjector({}).resolve(commonTokens.options);
      expect(optionsEditorApplierMock.edit).called;
    });

    it('should cache the config', () => {
      const injector = buildMainInjector({});
      injector.resolve(commonTokens.options);
      injector.resolve(commonTokens.options);
      expect(configReaderMock.readConfig).calledOnce;
    });

    it('should inject the `cliOptions` in the config reader', () => {
      const expectedCliOptions = { foo: 'bar' };
      buildMainInjector(expectedCliOptions).resolve(commonTokens.options);
      expect(configReaderModule.default).calledWith(expectedCliOptions);
    });

    it('should validate the options', () => {
      buildMainInjector({}).resolve(commonTokens.options);
      expect(optionsValidatorStub.validate).calledWith(expectedConfig);
    });
  });

  it('should supply mutatorDescriptor', () => {
    const expected: MutatorDescriptor = {
      name: 'javascript',
      plugins: null,
      excludedMutations: [],
    };
    const mutatorDescriptor = buildMainInjector({}).resolve(commonTokens.mutatorDescriptor);
    expect(mutatorDescriptor).deep.eq(expected);
  });

  it('should be able to supply the test framework', () => {
    const actualTestFramework = buildMainInjector({}).resolve(di.coreTokens.testFramework);
    expect(testFrameworkMock).eq(actualTestFramework);
  });

  it('should be able to supply the reporter', () => {
    const actualReporter = buildMainInjector({}).resolve(di.coreTokens.reporter);
    expect(actualReporter).eq(broadcastReporterMock);
  });

  it('should supply pluginCreators for Reporter, ConfigEditor and TestFramework plugins', () => {
    const injector = buildMainInjector({});
    expect(injector.resolve(di.coreTokens.pluginCreatorReporter)).eq(pluginCreatorMock);
    expect(injector.resolve(di.coreTokens.pluginCreatorTestFramework)).eq(pluginCreatorMock);
    expect(injector.resolve(di.coreTokens.pluginCreatorConfigEditor)).eq(pluginCreatorMock);
  });
});
