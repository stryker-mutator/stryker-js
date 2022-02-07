import { Injector } from 'typed-inject';
import { expect } from 'chai';
import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { PartialStrykerOptions, File, LogLevel } from '@stryker-mutator/api/core';
import { BaseContext } from '@stryker-mutator/api/plugin';

import sinon from 'sinon';

import { MutantInstrumenterContext, PrepareExecutor } from '../../../src/process/index.js';
import { coreTokens } from '../../../src/di/index.js';
import { LogConfigurator, LoggingClientContext } from '../../../src/logging/index.js';
import { InputFileResolver, InputFileCollection } from '../../../src/input/index.js';
import { TemporaryDirectory } from '../../../src/utils/temporary-directory.js';
import { ConfigError } from '../../../src/errors.js';
import { OptionsValidator } from '../../../src/config/options-validator.js';

interface AllContext extends MutantInstrumenterContext {
  [coreTokens.validationSchema]: unknown;
  [coreTokens.optionsValidator]: OptionsValidator;
}

describe(PrepareExecutor.name, () => {
  let cliOptions: PartialStrykerOptions;
  let configureMainProcessStub: sinon.SinonStub;
  let optionsValidatorMock: sinon.SinonStubbedInstance<OptionsValidator>;
  let configureLoggingServerStub: sinon.SinonStub;
  let injectorMock: sinon.SinonStubbedInstance<Injector<AllContext>>;
  let inputFileResolverMock: sinon.SinonStubbedInstance<InputFileResolver>;
  let inputFiles: InputFileCollection;
  let temporaryDirectoryMock: sinon.SinonStubbedInstance<TemporaryDirectory>;
  let sut: PrepareExecutor;

  beforeEach(() => {
    inputFiles = new InputFileCollection([new File('index.js', 'console.log("hello world");')], ['index.js'], []);
    cliOptions = {};
    configureMainProcessStub = sinon.stub(LogConfigurator, 'configureMainProcess');
    temporaryDirectoryMock = sinon.createStubInstance(TemporaryDirectory);
    inputFileResolverMock = sinon.createStubInstance(InputFileResolver);
    optionsValidatorMock = sinon.createStubInstance(OptionsValidator);
    configureLoggingServerStub = sinon.stub(LogConfigurator, 'configureLoggingServer');
    injectorMock = factory.injector() as unknown as sinon.SinonStubbedInstance<Injector<AllContext>>;
    injectorMock.resolve
      .withArgs(coreTokens.optionsValidator)
      .returns(optionsValidatorMock)
      .withArgs(coreTokens.temporaryDirectory)
      .returns(temporaryDirectoryMock);
    injectorMock.injectClass.withArgs(InputFileResolver).returns(inputFileResolverMock);
    inputFileResolverMock.resolve.resolves(inputFiles);
    sut = new PrepareExecutor(injectorMock as Injector<BaseContext>);
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
    expect(inputFileResolverMock.resolve).called;
    expect(injectorMock.provideValue).calledWithExactly(coreTokens.inputFiles, inputFiles);
  });

  it('should reject when logging server rejects', async () => {
    const expectedError = Error('expected error');
    configureLoggingServerStub.rejects(expectedError);
    await expect(sut.execute(cliOptions)).rejectedWith(expectedError);
  });

  it('should reject when input file globbing results in a rejection', async () => {
    const expectedError = Error('expected error');
    inputFileResolverMock.resolve.rejects(expectedError);
    await expect(sut.execute(cliOptions)).rejectedWith(expectedError);
  });

  it('should reject when no input files where found', async () => {
    inputFileResolverMock.resolve.resolves(new InputFileCollection([], [], []));
    await expect(sut.execute(cliOptions)).rejectedWith(ConfigError, 'No input files found');
  });

  it('should not create the temp directory when no input files where found', async () => {
    inputFileResolverMock.resolve.resolves(new InputFileCollection([], [], []));
    await expect(sut.execute(cliOptions)).rejected;
    expect(temporaryDirectoryMock.initialize).not.called;
  });
});
