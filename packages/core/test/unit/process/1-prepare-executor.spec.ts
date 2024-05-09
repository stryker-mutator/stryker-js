import path from 'path';

import sinon from 'sinon';
import { JSONSchema7 } from 'json-schema';
import { Injector } from 'typed-inject';
import { expect } from 'chai';
import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { PartialStrykerOptions, LogLevel } from '@stryker-mutator/api/core';
import { BaseContext } from '@stryker-mutator/api/plugin';
import { frameworkPluginsFileUrl } from '@stryker-mutator/instrumenter';

import { MutantInstrumenterContext, PrepareExecutor } from '../../../src/process/index.js';
import { coreTokens, PluginLoader, LoadedPlugins } from '../../../src/di/index.js';
import { LogConfigurator, LoggingClientContext } from '../../../src/logging/index.js';
import { Project, ProjectReader } from '../../../src/fs/index.js';
import { TemporaryDirectory } from '../../../src/utils/temporary-directory.js';
import { ConfigError } from '../../../src/errors.js';
import { ConfigReader, OptionsValidator, MetaSchemaBuilder } from '../../../src/config/index.js';
import { BroadcastReporter, reporterPluginsFileUrl } from '../../../src/reporters/index.js';
import { UnexpectedExitHandler } from '../../../src/unexpected-exit-handler.js';
import { FileSystemTestDouble } from '../../helpers/file-system-test-double.js';

interface AllContext extends MutantInstrumenterContext {
  [coreTokens.validationSchema]: unknown;
  [coreTokens.optionsValidator]: OptionsValidator;
  [coreTokens.pluginsByKind]: PluginLoader;
}

describe(PrepareExecutor.name, () => {
  let cliOptions: PartialStrykerOptions;
  let configReaderMock: sinon.SinonStubbedInstance<ConfigReader>;
  let pluginLoaderMock: sinon.SinonStubbedInstance<PluginLoader>;
  let metaSchemaBuilderMock: sinon.SinonStubbedInstance<MetaSchemaBuilder>;
  let configureMainProcessStub: sinon.SinonStub;
  let optionsValidatorMock: sinon.SinonStubbedInstance<OptionsValidator>;
  let configureLoggingServerStub: sinon.SinonStub;
  let injectorMock: sinon.SinonStubbedInstance<Injector<AllContext>>;
  let projectReaderMock: sinon.SinonStubbedInstance<ProjectReader>;
  let project: Project;
  let temporaryDirectoryMock: sinon.SinonStubbedInstance<TemporaryDirectory>;
  let loadedPlugins: LoadedPlugins;
  let sut: PrepareExecutor;

  beforeEach(() => {
    const fsTestDouble = new FileSystemTestDouble({ 'index.js': 'console.log("hello world");' });
    project = new Project(fsTestDouble, fsTestDouble.toFileDescriptions());
    cliOptions = {};
    configReaderMock = sinon.createStubInstance(ConfigReader);
    configReaderMock.readConfig.resolves(testInjector.options);
    metaSchemaBuilderMock = sinon.createStubInstance(MetaSchemaBuilder);
    configureMainProcessStub = sinon.stub(LogConfigurator, 'configureMainProcess');
    pluginLoaderMock = sinon.createStubInstance(PluginLoader);
    loadedPlugins = { pluginModulePaths: [], pluginsByKind: new Map(), schemaContributions: [] };
    pluginLoaderMock.load.resolves(loadedPlugins);
    temporaryDirectoryMock = sinon.createStubInstance(TemporaryDirectory);
    projectReaderMock = sinon.createStubInstance(ProjectReader);
    optionsValidatorMock = sinon.createStubInstance(OptionsValidator);
    configureLoggingServerStub = sinon.stub(LogConfigurator, 'configureLoggingServer');
    injectorMock = factory.injector() as unknown as sinon.SinonStubbedInstance<Injector<AllContext>>;
    injectorMock.resolve.withArgs(coreTokens.temporaryDirectory).returns(temporaryDirectoryMock);
    injectorMock.injectClass
      .withArgs(PluginLoader)
      .returns(pluginLoaderMock)
      .withArgs(OptionsValidator)
      .returns(optionsValidatorMock)
      .withArgs(MetaSchemaBuilder)
      .returns(metaSchemaBuilderMock)
      .withArgs(ConfigReader)
      .returns(configReaderMock)
      .withArgs(ProjectReader)
      .returns(projectReaderMock);
    projectReaderMock.read.resolves(project);
    sut = new PrepareExecutor(injectorMock as Injector<BaseContext>);
  });

  it('should provide the cliOptions to the config reader', async () => {
    await sut.execute(cliOptions);
    expect(configReaderMock.readConfig).calledWithExactly(cliOptions);
  });

  it('should load the plugins', async () => {
    // Arrange
    testInjector.options.appendPlugins = ['appended'];
    testInjector.options.plugins = ['@stryker-mutator/*', './my-custom-plugin.js'];

    // Act
    await sut.execute(cliOptions);

    // Assert
    sinon.assert.calledWithExactly(pluginLoaderMock.load, [
      '@stryker-mutator/*',
      './my-custom-plugin.js',
      frameworkPluginsFileUrl,
      reporterPluginsFileUrl,
      'appended',
    ]);
  });

  it('should provided the loaded modules as pluginModulePaths', async () => {
    // Arrange
    const expectedPluginPaths = ['@stryker-mutator/core', path.resolve('./my-custom-plugin.js'), 'appended'];
    loadedPlugins.pluginModulePaths.push(...expectedPluginPaths);

    // Act
    await sut.execute(cliOptions);

    // Assert
    sinon.assert.calledWithExactly(injectorMock.provideValue, coreTokens.pluginModulePaths, expectedPluginPaths);
  });

  it('should validate final options with the meta schema', async () => {
    // Arrange
    const contributions = [{ some: 'schema contributions' }];
    const metaSchema: JSONSchema7 = { properties: { meta: { $comment: 'schema' } } };
    loadedPlugins.schemaContributions.push(...contributions);
    metaSchemaBuilderMock.buildMetaSchema.returns(metaSchema);

    // Act
    await sut.execute(cliOptions);

    // Assert
    sinon.assert.calledWithExactly(metaSchemaBuilderMock.buildMetaSchema, contributions);
    sinon.assert.calledWithExactly(injectorMock.provideValue, coreTokens.validationSchema, metaSchema);
    sinon.assert.calledWithExactly(optionsValidatorMock.validate, testInjector.options, true);
  });

  it('should configure logging for the main process', async () => {
    await sut.execute(cliOptions);
    expect(configureMainProcessStub).calledOnce;
  });

  it('should configure the logging server', async () => {
    const expectedLoggingContext: LoggingClientContext = {
      level: LogLevel.Fatal,
      port: 1337,
    };
    configureLoggingServerStub.resolves(expectedLoggingContext);
    testInjector.options.logLevel = LogLevel.Information;
    testInjector.options.fileLogLevel = LogLevel.Trace;
    testInjector.options.allowConsoleColors = true;
    await sut.execute(cliOptions);
    expect(configureLoggingServerStub).calledWithExactly(LogLevel.Information, LogLevel.Trace, true);
    expect(injectorMock.provideValue).calledWithExactly(coreTokens.loggingContext, expectedLoggingContext);
  });

  it('should resolve input files', async () => {
    await sut.execute(cliOptions);
    expect(projectReaderMock.read).called;
    expect(injectorMock.provideValue).calledWithExactly(coreTokens.project, project);
  });

  it('should provide the reporter the reporter', async () => {
    await sut.execute(cliOptions);
    sinon.assert.calledWithExactly(injectorMock.provideClass, coreTokens.reporter, BroadcastReporter);
  });

  it('should provide the UnexpectedExitRegister', async () => {
    await sut.execute(cliOptions);
    sinon.assert.calledWithExactly(injectorMock.provideClass, coreTokens.unexpectedExitRegistry, UnexpectedExitHandler);
  });

  it('should reject when logging server rejects', async () => {
    const expectedError = Error('expected error');
    configureLoggingServerStub.rejects(expectedError);
    await expect(sut.execute(cliOptions)).rejectedWith(expectedError);
  });

  it('should reject when input file globbing results in a rejection', async () => {
    const expectedError = Error('expected error');
    projectReaderMock.read.rejects(expectedError);
    await expect(sut.execute(cliOptions)).rejectedWith(expectedError);
  });

  it('should reject when no input files where found', async () => {
    projectReaderMock.read.resolves(new Project(new FileSystemTestDouble(), {}));
    await expect(sut.execute(cliOptions)).rejectedWith(ConfigError, 'No input files found');
  });

  it('should not create the temp directory when no input files where found', async () => {
    projectReaderMock.read.resolves(new Project(new FileSystemTestDouble(), {}));
    await expect(sut.execute(cliOptions)).rejected;
    expect(temporaryDirectoryMock.initialize).not.called;
  });
});
