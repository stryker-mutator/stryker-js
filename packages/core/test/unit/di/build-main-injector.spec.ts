import { commonTokens, PluginKind } from '@stryker-mutator/api/plugin';
import { Reporter } from '@stryker-mutator/api/report';
import { factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { StrykerOptions, PartialStrykerOptions } from '@stryker-mutator/api/core';
import { createInjector } from 'typed-inject';

import * as optionsValidatorModule from '../../../src/config/options-validator';
import * as pluginLoaderModule from '../../../src/di/plugin-loader';
import * as configReaderModule from '../../../src/config/config-reader';
import { PluginCreator, PluginLoader, coreTokens, provideLogger } from '../../../src/di';
import { buildMainInjector, CliOptionsProvider } from '../../../src/di/build-main-injector';
import * as broadcastReporterModule from '../../../src/reporters/broadcast-reporter';
import { currentLogMock } from '../../helpers/log-mock';
import { UnexpectedExitHandler } from '../../../src/unexpected-exit-handler';

describe(buildMainInjector.name, () => {
  let pluginLoaderMock: sinon.SinonStubbedInstance<PluginLoader>;
  let configReaderMock: sinon.SinonStubbedInstance<configReaderModule.ConfigReader>;
  let pluginCreatorMock: sinon.SinonStubbedInstance<PluginCreator<PluginKind>>;
  let broadcastReporterMock: sinon.SinonStubbedInstance<Reporter>;
  let optionsValidatorStub: sinon.SinonStubbedInstance<optionsValidatorModule.OptionsValidator>;
  let expectedConfig: StrykerOptions;
  let validationSchemaContributions: Array<Record<string, unknown>>;
  let injector: CliOptionsProvider;
  let cliOptions: PartialStrykerOptions;

  beforeEach(() => {
    configReaderMock = sinon.createStubInstance(configReaderModule.ConfigReader);
    pluginCreatorMock = sinon.createStubInstance(PluginCreator);
    pluginCreatorMock = sinon.createStubInstance(PluginCreator);
    pluginLoaderMock = sinon.createStubInstance(PluginLoader);
    optionsValidatorStub = sinon.createStubInstance(optionsValidatorModule.OptionsValidator);
    validationSchemaContributions = [];
    pluginLoaderMock.resolveValidationSchemaContributions.returns(validationSchemaContributions);
    expectedConfig = factory.strykerOptions();
    broadcastReporterMock = factory.reporter('broadcast');
    configReaderMock.readConfig.returns(expectedConfig);
    cliOptions = {};
    injector = provideLogger(createInjector()).provideValue(coreTokens.cliOptions, cliOptions);
    stubInjectable(PluginCreator, 'createFactory').returns(() => pluginCreatorMock);
    stubInjectable(optionsValidatorModule, 'OptionsValidator').returns(optionsValidatorStub);
    stubInjectable(pluginLoaderModule, 'PluginLoader').returns(pluginLoaderMock);
    stubInjectable(configReaderModule, 'ConfigReader').returns(configReaderMock);
    stubInjectable(broadcastReporterModule, 'BroadcastReporter').returns(broadcastReporterMock);
  });

  afterEach(async () => {
    await injector.dispose();
  });

  function stubInjectable<T>(obj: T, method: keyof T) {
    const inject = (obj[method] as any).inject;
    const stub = sinon.stub(obj, method);
    (stub as any).inject = inject;
    return stub;
  }

  describe('resolve options', () => {
    it('should supply readonly stryker options', () => {
      const actualOptions = buildMainInjector(injector).resolve(commonTokens.options);
      expect(actualOptions).frozen;
    });

    it('should load default plugins', () => {
      buildMainInjector(injector).resolve(commonTokens.options);
      expect(PluginLoader).calledWithNew;
      expect(PluginLoader).calledWith(currentLogMock(), ['@stryker-mutator/*', require.resolve('../../../src/reporters')]);
    });

    it('should load plugins', () => {
      buildMainInjector(injector).resolve(commonTokens.options);
      expect(pluginLoaderMock.load).called;
    });

    it('should cache the config', () => {
      const actualInjector = buildMainInjector(injector);
      actualInjector.resolve(commonTokens.options);
      actualInjector.resolve(commonTokens.options);
      expect(configReaderMock.readConfig).calledOnce;
    });

    it('should inject the `cliOptions` in the config reader', () => {
      cliOptions.mutate = ['some', 'files'];
      buildMainInjector(injector).resolve(commonTokens.options);
      expect(configReaderModule.ConfigReader).calledWith(cliOptions);
    });

    it('should validate the options', () => {
      buildMainInjector(injector).resolve(commonTokens.options);
      expect(optionsValidatorStub.validate).calledWith(expectedConfig);
    });

    it('should warn about unknown properties', () => {
      expectedConfig.foo = 'bar';
      buildMainInjector(injector).resolve(commonTokens.options);
      expect(currentLogMock().warn).calledWithMatch('Unknown stryker config option "foo"');
    });
  });

  it('should be able to supply the reporter', () => {
    const actualReporter = buildMainInjector(injector).resolve(coreTokens.reporter);
    expect(actualReporter).eq(broadcastReporterMock);
  });

  it('should supply pluginCreators for Reporter and Checker plugins', () => {
    const actualInjector = buildMainInjector(injector);
    expect(actualInjector.resolve(coreTokens.pluginCreatorReporter)).eq(pluginCreatorMock);
    expect(actualInjector.resolve(coreTokens.pluginCreatorChecker)).eq(pluginCreatorMock);
  });

  it('should be able to supply a UnexpectedExitRegister', () => {
    const actualInjector = buildMainInjector(injector);
    expect(actualInjector.resolve(coreTokens.unexpectedExitRegistry)).instanceOf(UnexpectedExitHandler);
  });
});
