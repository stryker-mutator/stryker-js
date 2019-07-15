import { buildMainInjector } from '../../../src/di/buildMainInjector';
import * as di from '../../../src/di';
import * as sinon from 'sinon';
import { factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { COMMON_TOKENS } from '@stryker-mutator/api/plugin';
import { Config } from '@stryker-mutator/api/config';
import { TestFramework } from '@stryker-mutator/api/test_framework';
import TestFrameworkOrchestrator, * as testFrameworkOrchestratorModule from '../../../src/TestFrameworkOrchestrator';
import { PluginCreator } from '../../../src/di';
import ConfigReader, * as configReaderModule from '../../../src/config/ConfigReader';
import * as configModule from '../../../src/config';
import { Reporter } from '@stryker-mutator/api/report';
import * as broadcastReporterModule from '../../../src/reporters/BroadcastReporter';
import currentLogMock from '../../helpers/logMock';

describe(buildMainInjector.name, () => {

  let testFrameworkOrchestratorMock: sinon.SinonStubbedInstance<TestFrameworkOrchestrator>;
  let pluginLoaderMock: sinon.SinonStubbedInstance<di.PluginLoader>;
  let testFrameworkMock: TestFramework;
  let configReaderMock: sinon.SinonStubbedInstance<ConfigReader>;
  let pluginCreatorMock: sinon.SinonStubbedInstance<PluginCreator<any>>;
  let configEditorApplierMock: sinon.SinonStubbedInstance<configModule.ConfigEditorApplier>;
  let broadcastReporterMock: sinon.SinonStubbedInstance<Reporter>;
  let expectedConfig: Config;

  beforeEach(() => {
    configReaderMock = sinon.createStubInstance(ConfigReader);
    pluginCreatorMock = sinon.createStubInstance(PluginCreator);
    configEditorApplierMock = sinon.createStubInstance(configModule.ConfigEditorApplier);
    testFrameworkMock = factory.testFramework();
    testFrameworkOrchestratorMock = sinon.createStubInstance(TestFrameworkOrchestrator);
    testFrameworkOrchestratorMock.determineTestFramework.returns(testFrameworkMock);
    pluginLoaderMock = sinon.createStubInstance(di.PluginLoader);
    expectedConfig = new Config();
    broadcastReporterMock = factory.reporter('broadcast');
    configReaderMock.readConfig.returns(expectedConfig);
    stubInjectable(PluginCreator, 'createFactory').returns(() => pluginCreatorMock);
    stubInjectable(configModule, 'ConfigEditorApplier').returns(configEditorApplierMock);
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
      const actualOptions = buildMainInjector({}).resolve(COMMON_TOKENS.options);
      expect(actualOptions).frozen;
    });

    it('should load default plugins', () => {
      buildMainInjector({}).resolve(COMMON_TOKENS.options);
      expect(di.PluginLoader).calledWithNew;
      expect(di.PluginLoader).calledWith(currentLogMock(), ['@stryker-mutator/*', require.resolve('../../../src/reporters')]);
    });

    it('should load plugins', () => {
      buildMainInjector({}).resolve(COMMON_TOKENS.options);
      expect(pluginLoaderMock.load).called;
    });

    it('should apply config editors', () => {
      buildMainInjector({}).resolve(COMMON_TOKENS.options);
      expect(configEditorApplierMock.edit).called;
    });

    it('should cache the config', () => {
      const injector = buildMainInjector({});
      injector.resolve(COMMON_TOKENS.options);
      injector.resolve(COMMON_TOKENS.options);
      expect(configReaderMock.readConfig).calledOnce;
    });

    it('should inject the `cliOptions` in the config reader', () => {
      const expectedCliOptions = { foo: 'bar' };
      buildMainInjector(expectedCliOptions).resolve(COMMON_TOKENS.options);
      expect(configReaderModule.default).calledWith(expectedCliOptions);
    });
  });

  it('should be able to supply the test framework', () => {
    const actualTestFramework = buildMainInjector({}).resolve(di.coreTokens.TestFramework);
    expect(testFrameworkMock).eq(actualTestFramework);
  });

  it('should be able to supply the reporter', () => {
    const actualReporter = buildMainInjector({}).resolve(di.coreTokens.Reporter);
    expect(actualReporter).eq(broadcastReporterMock);
  });

  it('should supply pluginCreators for Reporter, ConfigEditor and TestFramework plugins', () => {
    const injector = buildMainInjector({});
    expect(injector.resolve(di.coreTokens.PluginCreatorReporter)).eq(pluginCreatorMock);
    expect(injector.resolve(di.coreTokens.PluginCreatorTestFramework)).eq(pluginCreatorMock);
    expect(injector.resolve(di.coreTokens.PluginCreatorConfigEditor)).eq(pluginCreatorMock);
  });
});
