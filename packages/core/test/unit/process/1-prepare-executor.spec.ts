import { Injector } from 'typed-inject';
import { expect } from 'chai';
import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { PartialStrykerOptions, File, LogLevel } from '@stryker-mutator/api/core';
import { commonTokens } from '@stryker-mutator/api/plugin';

import sinon = require('sinon');

import { PrepareExecutor } from '../../../src/process';
import { coreTokens } from '../../../src/di';
import { LogConfigurator, LoggingClientContext } from '../../../src/logging';
import * as buildMainInjectorModule from '../../../src/di/build-main-injector';
import Timer from '../../../src/utils/timer';
import InputFileResolver from '../../../src/input/input-file-resolver';
import InputFileCollection from '../../../src/input/input-file-collection';

import { TemporaryDirectory } from '../../../src/utils/temporary-directory';
import { ConfigError } from '../../../src/errors';

describe(PrepareExecutor.name, () => {
  let cliOptions: PartialStrykerOptions;
  let configureMainProcessStub: sinon.SinonStub;
  let configureLoggingServerStub: sinon.SinonStub;
  let injectorMock: sinon.SinonStubbedInstance<Injector<buildMainInjectorModule.MainContext>>;
  let timerMock: sinon.SinonStubbedInstance<Timer>;
  let inputFileResolverMock: sinon.SinonStubbedInstance<InputFileResolver>;
  let inputFiles: InputFileCollection;
  let temporaryDirectoryMock: sinon.SinonStubbedInstance<TemporaryDirectory>;
  let sut: PrepareExecutor;

  beforeEach(() => {
    inputFiles = new InputFileCollection([new File('index.js', 'console.log("hello world");')], ['index.js']);
    cliOptions = {};
    timerMock = sinon.createStubInstance(Timer);
    temporaryDirectoryMock = sinon.createStubInstance(TemporaryDirectory);
    inputFileResolverMock = sinon.createStubInstance(InputFileResolver);
    configureMainProcessStub = sinon.stub(LogConfigurator, 'configureMainProcess');
    configureLoggingServerStub = sinon.stub(LogConfigurator, 'configureLoggingServer');
    injectorMock = factory.injector();
    sinon.stub(buildMainInjectorModule, 'buildMainInjector').returns(injectorMock as Injector<buildMainInjectorModule.MainContext>);
    injectorMock.resolve
      .withArgs(commonTokens.options)
      .returns(testInjector.options)
      .withArgs(coreTokens.timer)
      .returns(timerMock)
      .withArgs(coreTokens.temporaryDirectory)
      .returns(temporaryDirectoryMock);
    injectorMock.injectClass.withArgs(InputFileResolver).returns(inputFileResolverMock);
    inputFileResolverMock.resolve.resolves(inputFiles);
    sut = new PrepareExecutor(cliOptions, injectorMock as Injector<buildMainInjectorModule.MainContext>);
  });

  it('should configure logging for the main process', async () => {
    await sut.execute();
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
    await sut.execute();
    expect(configureLoggingServerStub).calledWithExactly(LogLevel.Information, LogLevel.Trace, true);
    expect(injectorMock.provideValue).calledWithExactly(coreTokens.loggingContext, expectedLoggingContext);
  });

  it('should build the main injector', async () => {
    await sut.execute();
    expect(buildMainInjectorModule.buildMainInjector).calledWith(injectorMock);
  });

  it('should reset the timer', async () => {
    await sut.execute();
    expect(timerMock.reset).calledOnce;
  });

  it('should resolve input files', async () => {
    await sut.execute();
    expect(inputFileResolverMock.resolve).called;
    expect(injectorMock.provideValue).calledWithExactly(coreTokens.inputFiles, inputFiles);
  });

  it('should reject when logging server rejects', async () => {
    const expectedError = Error('expected error');
    configureLoggingServerStub.rejects(expectedError);
    await expect(sut.execute()).rejectedWith(expectedError);
  });

  it('should reject when input file globbing results in a rejection', async () => {
    const expectedError = Error('expected error');
    inputFileResolverMock.resolve.rejects(expectedError);
    await expect(sut.execute()).rejectedWith(expectedError);
  });

  it('should reject when no input files where found', async () => {
    inputFileResolverMock.resolve.resolves(new InputFileCollection([], []));
    await expect(sut.execute()).rejectedWith(ConfigError, 'No input files found');
  });

  it('should not create the temp directory when no input files where found', async () => {
    inputFileResolverMock.resolve.resolves(new InputFileCollection([], []));
    await expect(sut.execute()).rejected;
    expect(temporaryDirectoryMock.initialize).not.called;
  });
});
