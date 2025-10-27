import net from 'net';
import stream from 'stream';
import { factory, testInjector, tick } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import * as typedInject from 'typed-inject';
import {
  PartialStrykerOptions,
  MutantResult,
  FileDescriptions,
  LogLevel,
} from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens } from '@stryker-mutator/api/plugin';

import { StrykerServer } from '../../src/stryker-server.js';
import { firstValueFrom, Observable } from 'rxjs';
import {
  DryRunExecutor,
  MutantInstrumenterExecutor,
  MutationTestContext,
  MutationTestExecutor,
  PrepareExecutor,
} from '../../src/process/index.js';
import { coreTokens, PluginCreator } from '../../src/di/index.js';
import { TemporaryDirectory } from '../../src/utils/temporary-directory.js';
import { LoggingServer } from '../../src/logging/logging-server.js';
import { ConfigureParams, ConfigureResult } from 'mutation-server-protocol';
import { Stryker } from '../../src/stryker.js';
import {
  createInstrumenter,
  Instrumenter,
  InstrumentResult,
} from '@stryker-mutator/instrumenter';
import { FileSystemTestDouble } from '../helpers/file-system-test-double.js';
import { Project } from '../../src/fs/project.js';
import { Reporter } from '@stryker-mutator/api/report';
import { StrictReporter } from '../../src/reporters/strict-reporter.js';

describe(StrykerServer.name, () => {
  let sut: StrykerServer;
  let injectorMock: sinon.SinonStubbedInstance<
    typedInject.Injector<
      MutationTestContext & { [coreTokens.loggingServer]: LoggingServer } & {
        [coreTokens.reporterOverride]: StrictReporter;
      }
    >
  >;
  let cliOptions: PartialStrykerOptions;
  let loggerMock: sinon.SinonStubbedInstance<Logger>;
  let loggingServerMock: sinon.SinonStubbedInstance<LoggingServer>;
  let temporaryDirectoryMock: sinon.SinonStubbedInstance<TemporaryDirectory>;
  let getLoggerStub: sinon.SinonStub;
  let strykerRunStub: sinon.SinonStubbedMember<typeof Stryker.run>;

  let prepareExecutorMock: sinon.SinonStubbedInstance<PrepareExecutor>;
  let mutantInstrumenterExecutorMock: sinon.SinonStubbedInstance<MutantInstrumenterExecutor>;
  let dryRunExecutorMock: sinon.SinonStubbedInstance<DryRunExecutor>;
  let mutationTestExecutorMock: sinon.SinonStubbedInstance<MutationTestExecutor>;
  let instrumenterMock: sinon.SinonStubbedInstance<Instrumenter>;
  let instrumentResult: InstrumentResult;
  let pluginCreatorMock: sinon.SinonStubbedInstance<PluginCreator>;
  let projectMock: Project;

  let mutantResults: MutantResult[];

  function connectClient() {
    const client = sinon.createStubInstance(net.Socket);
    createServerStub.callArgWith(0, client);
    return client;
  }

  let serverMock: sinon.SinonStubbedInstance<net.Server>;
  let createServerStub: sinon.SinonStubbedMember<typeof net.createServer>;
  const port = 8080;
  function arrangeStartSocket() {
    serverMock.address.returns({ port } as net.AddressInfo);
    serverMock.listen.callsArg(2);
  }

  function arrangeStdioChannel(messages: Buffer[]) {
    const readable = stream.Readable.from(
      messages.map((msg) =>
        Buffer.concat([
          Buffer.from(`Content-Length: ${msg.length}\r\n\r\n`),
          msg,
        ]),
      ),
    );
    const writable = new stream.PassThrough();
    sinon.stub(process, 'stdin').value(readable);
    sinon.stub(process, 'stdout').value(writable);

    return writable;
  }

  beforeEach(() => {
    injectorMock = factory.injector();
    loggerMock = factory.logger();
    getLoggerStub = sinon.stub();
    loggingServerMock = sinon.createStubInstance(LoggingServer);
    mutantResults = [];
    temporaryDirectoryMock = sinon.createStubInstance(TemporaryDirectory);
    prepareExecutorMock = sinon.createStubInstance(PrepareExecutor);
    mutantInstrumenterExecutorMock = sinon.createStubInstance(
      MutantInstrumenterExecutor,
    );
    dryRunExecutorMock = sinon.createStubInstance(DryRunExecutor);
    mutationTestExecutorMock = sinon.createStubInstance(MutationTestExecutor);
    instrumentResult = {
      files: [
        {
          name: 'foo.js',
          content: 'console.log(global.activeMutant === 1? "": "bar")',
          mutate: true,
        },
      ],
      mutants: [factory.mutant({ id: '1', replacement: 'bar' })],
    };
    instrumenterMock = sinon.createStubInstance(Instrumenter);
    instrumenterMock.instrument.resolves(instrumentResult);
    pluginCreatorMock = sinon.createStubInstance(PluginCreator);
    const fsTestDouble = new FileSystemTestDouble({
      'src/foo.js': 'console.log("bar")',
      'src/foo.spec.js': '',
    });
    const fileDescriptions: FileDescriptions = {
      'src/foo.js': { mutate: true },
      'src/foo.spec.js': { mutate: false },
    };
    projectMock = new Project(fsTestDouble, fileDescriptions);
    injectorMock.injectClass
      .withArgs(PrepareExecutor)
      .returns(prepareExecutorMock)
      .withArgs(MutantInstrumenterExecutor)
      .returns(mutantInstrumenterExecutorMock)
      .withArgs(DryRunExecutor)
      .returns(dryRunExecutorMock)
      .withArgs(MutationTestExecutor)
      .returns(mutationTestExecutorMock);
    injectorMock.resolve
      .withArgs(commonTokens.getLogger)
      .returns(getLoggerStub)
      .withArgs(coreTokens.temporaryDirectory)
      .returns(temporaryDirectoryMock)
      .withArgs(commonTokens.options)
      .returns(testInjector.options)
      .withArgs(coreTokens.loggingServer)
      .returns(loggingServerMock)
      .withArgs(coreTokens.pluginCreator)
      .returns(pluginCreatorMock)
      .withArgs(coreTokens.project)
      .returns(projectMock);
    injectorMock.injectFunction
      .withArgs(createInstrumenter)
      .returns(instrumenterMock);
    getLoggerStub.returns(loggerMock);

    prepareExecutorMock.execute.resolves(
      injectorMock as typedInject.Injector<MutationTestContext>,
    );
    mutantInstrumenterExecutorMock.execute.resolves(
      injectorMock as typedInject.Injector<MutationTestContext>,
    );
    dryRunExecutorMock.execute.resolves(
      injectorMock as typedInject.Injector<MutationTestContext>,
    );
    mutationTestExecutorMock.execute.resolves(mutantResults);
    cliOptions = {};
    serverMock = sinon.createStubInstance(net.Server);
    serverMock.close.callsArg(0);
    createServerStub = sinon.stub(net, 'createServer').returns(serverMock);
    strykerRunStub = sinon.stub(Stryker, 'run');
  });

  afterEach(async () => {
    await sut.stop();
  });

  describe('configure', () => {
    beforeEach(() => {
      sut = new StrykerServer(
        { channel: 'socket' },
        cliOptions,
        () => injectorMock,
      );
    });

    it('configures options for stryker run', async () => {
      const mutantResult: MutantResult = {
        fileName: 'foo.js',
        replacement: 'mutatedCode',
        id: '1',
        location: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
        mutatorName: 'TestMutator',
        status: 'Killed',
      };
      strykerRunStub.resolves([mutantResult]);
      arrangeStartSocket();

      const configureParams: ConfigureParams = {
        configFilePath: 'non-existent-test-file',
      };

      sut.configure(configureParams);
      await sut.start();
      sut.mutationTest({}).subscribe().unsubscribe();

      sinon.assert.calledWithMatch(strykerRunStub, sinon.match.any, {
        cliOptions: {
          ...cliOptions,
          configFile: 'non-existent-test-file',
        },
        targetMutatePatterns: undefined,
      });
    });

    it('returns the version after configuring successfully', () => {
      const configureParams: ConfigureParams = {};
      const expected: ConfigureResult = { version: '0.4.0' };

      const actual = sut.configure(configureParams);

      expect(actual).to.deep.equal(expected);
    });
  });

  describe('start', () => {
    beforeEach(() => {
      sut = new StrykerServer(
        { channel: 'socket' },
        cliOptions,
        () => injectorMock,
      );
    });

    it('starts the server and resolves with a port number', async () => {
      arrangeStartSocket();

      const actual = await sut.start();

      expect(actual).to.equal(port);
    });

    it('throws an error when the server has already been started', async () => {
      arrangeStartSocket();
      await sut.start();

      const act = () => sut.start();

      await expect(act()).to.be.eventually.rejectedWith(
        'Server already started',
      );
    });

    it('should handle mutationTest RPC and send progress notifications over the socket', async () => {
      const mutantResult: MutantResult = {
        fileName: 'foo.js',
        id: '1',
        status: 'Killed',
        replacement: 'mutatedCode',
        location: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
        mutatorName: 'TestMutator',
      };
      sinon.stub(sut, 'mutationTest').returns(
        new Observable<MutantResult>((observer) => {
          observer.next(mutantResult);
          observer.complete();
        }),
      );
      const expectedReportMutationTestProgressNotification =
        '{"jsonrpc":"2.0","method":"reportMutationTestProgress","params":{"files":{"foo.js":{"mutants":[{"id":"1","status":"Killed","replacement":"mutatedCode","location":{"start":{"line":1,"column":0},"end":{"line":1,"column":10}},"mutatorName":"TestMutator"}]}}}}';
      arrangeStartSocket();
      await sut.start();
      const client = connectClient();

      const mutationTestRequest = Buffer.from(
        JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'mutationTest',
          params: {},
        }),
      );
      client.on
        .withArgs(sinon.match('data'), sinon.match.func)
        .callArgWith(
          1,
          Buffer.concat([
            Buffer.from(
              `Content-Length: ${mutationTestRequest.length}\r\n\r\n`,
            ),
            mutationTestRequest,
          ]),
        );
      await tick();

      expect(client.write.called).to.be.true;
      const writeArgs = client.write
        .getCalls()
        .map((call) => String(call.args[0]));
      expect(writeArgs[0]).to.equal(
        `Content-Length: ${expectedReportMutationTestProgressNotification.length}\r\n\r\n`,
      );
      expect(writeArgs[1]).to.equal(
        expectedReportMutationTestProgressNotification,
      );
    });

    it('should configure the logging server to use stderr', async () => {
      arrangeStartSocket();
      await sut.start();
      sinon.assert.calledWithExactly(
        injectorMock.provideValue,
        coreTokens.loggerConsoleOut,
        process.stderr,
      );
    });
  });

  describe('stop', () => {
    beforeEach(() => {
      sut = new StrykerServer(
        { channel: 'socket' },
        cliOptions,
        () => injectorMock,
      );
    });

    it('stops the server after starting', async () => {
      arrangeStartSocket();
      await sut.start();

      const stopPromise = sut.stop();
      await stopPromise;

      expect(serverMock.close).calledOnce;
    });

    it('should stop listening to stdin when using stdio channel', async () => {
      const readable = stream.Readable.from([]);
      sinon.stub(process, 'stdin').value(readable);
      sut = new StrykerServer(
        { channel: 'stdio' },
        cliOptions,
        () => injectorMock,
      );
      await sut.start();
      expect(process.stdin.listenerCount('data')).to.equal(1);

      await sut.stop();
      expect(process.stdin.listenerCount('data')).to.equal(0);
    });
  });

  describe('discover', () => {
    beforeEach(() => {
      sut = new StrykerServer(
        { channel: 'socket' },
        cliOptions,
        () => injectorMock,
      );
    });

    it('throws an error when the server has not been started yet', async () => {
      const act = () => sut.discover({});

      await expect(act()).to.be.eventually.rejectedWith(
        "Stryker server isn't started yet, please call `start` first",
      );
    });

    it('should discover mutants', async () => {
      arrangeStartSocket();
      await sut.start();

      const actual = await sut.discover({});

      expect(actual).to.deep.equal({
        files: {
          file: {
            mutants: [
              {
                id: '1',
                mutatorName: 'foobarMutator',
                location: {
                  end: { column: 1, line: 1 },
                  start: { column: 1, line: 1 },
                },
                replacement: 'bar',
              },
            ],
          },
        },
      });
    });

    it('should pass along the cli options', async () => {
      arrangeStartSocket();
      await sut.start();

      await sut.discover({});

      sinon.assert.calledWithMatch(prepareExecutorMock.execute, {
        cliOptions: {
          ...cliOptions,
          allowConsoleColors: false,
          logLevel: LogLevel.Warning,
        },
      });
    });

    it('should pass along the config file from the configure call', async () => {
      sut.configure({ configFilePath: 'foo/bar/stryker-config.json' });
      arrangeStartSocket();
      await sut.start();

      await sut.discover({});

      sinon.assert.calledWithMatch(prepareExecutorMock.execute, {
        cliOptions: {
          ...cliOptions,
          allowConsoleColors: false,
          configFile: 'foo/bar/stryker-config.json',
        },
      });
    });

    it('should pass along the files to mutate', async () => {
      arrangeStartSocket();
      await sut.start();

      await sut.discover({
        files: [{ path: 'src/' }, { path: 'foo/test.js' }],
      });

      sinon.assert.calledWithMatch(prepareExecutorMock.execute, {
        cliOptions: {
          ...cliOptions,
          allowConsoleColors: false,
        },
        targetMutatePatterns: ['src/**/*', 'foo/test.js'],
      });
    });
  });

  describe('mutationTest', () => {
    const createMutantResult = () => {
      return factory.killedMutantResult({
        fileName: 'foo.js',
        location: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      });
    };

    beforeEach(() => {
      sut = new StrykerServer(
        { channel: 'socket' },
        cliOptions,
        () => injectorMock,
      );
    });

    it('throws an error when the server has not been started yet', async () => {
      const act = () => sut.mutationTest({});

      await expect(firstValueFrom(act())).to.be.eventually.rejectedWith(
        "Stryker server isn't started yet, please call `start` first",
      );
    });

    it('mutates a file and reports the result', async () => {
      const mutantResult = createMutantResult();
      arrangeStartSocket();
      strykerRunStub.resolves([mutantResult]);
      sut.configure({ configFilePath: 'non-existent-test-file' });
      await sut.start();

      const mutationTestPromise = firstValueFrom(
        sut.mutationTest({ files: [{ path: 'foo.js' }] }),
      );
      const reporter = injectorMock.provideValue
        .getCalls()
        .find((v) => v.args[0] === coreTokens.reporterOverride)
        ?.args[1] as Reporter;
      reporter.onMutantTested!(mutantResult);
      const mutant = await mutationTestPromise;

      // Assert
      expect(mutant).to.deep.equal(mutantResult);
      sinon.assert.calledWithMatch(strykerRunStub, sinon.match.any, {
        cliOptions: {
          ...cliOptions,
          allowConsoleColors: false,
          configFile: 'non-existent-test-file',
        },
        targetMutatePatterns: ['foo.js'],
      });
    });

    it('mutates all files in a directory and reports the result', async () => {
      const mutantResult = createMutantResult();
      arrangeStartSocket();
      strykerRunStub.resolves([mutantResult]);
      sut.configure({ configFilePath: 'non-existent-test-file' });
      await sut.start();

      const mutationTestPromise = firstValueFrom(
        sut.mutationTest({ files: [{ path: 'src/' }] }),
      );
      const reporter = injectorMock.provideValue
        .getCalls()
        .find((v) => v.args[0] === coreTokens.reporterOverride)
        ?.args[1] as Reporter;
      reporter.onMutantTested!(mutantResult);
      const mutant = await mutationTestPromise;

      expect(mutant).to.deep.equal(mutantResult);
      sinon.assert.calledWithMatch(strykerRunStub, sinon.match.any, {
        cliOptions: {
          ...cliOptions,
          allowConsoleColors: false,
          configFile: 'non-existent-test-file',
        },
        targetMutatePatterns: ['src/**/*'],
      });
    });

    it('mutates a range of a file and reports the result', async () => {
      const mutantResult = createMutantResult();
      arrangeStartSocket();
      strykerRunStub.resolves([mutantResult]);
      sut.configure({ configFilePath: 'non-existent-test-file' });
      await sut.start();

      const mutationTestPromise = firstValueFrom(
        sut.mutationTest({
          files: [
            {
              path: 'foo.js',
              range: {
                start: { line: 1, column: 20 },
                end: { line: 2, column: 20 },
              },
            },
          ],
        }),
      );
      const reporter = injectorMock.provideValue
        .getCalls()
        .find((v) => v.args[0] === coreTokens.reporterOverride)
        ?.args[1] as Reporter;
      reporter.onMutantTested!(mutantResult);
      const mutant = await mutationTestPromise;

      expect(mutant).to.deep.equal(mutantResult);
      sinon.assert.calledWithMatch(strykerRunStub, sinon.match.any, {
        cliOptions: {
          ...cliOptions,
          allowConsoleColors: false,
          configFile: 'non-existent-test-file',
        },
        targetMutatePatterns: ['foo.js:1:19-2:19'],
      });
    });

    it('should dispose the temporary directory after a successful mutation test run', async () => {
      arrangeStartSocket();
      await sut.start();
      strykerRunStub.resolves([]);
      injectorMock.dispose.returns(Promise.resolve());

      await finalize(sut.mutationTest({ files: [{ path: 'foo.js' }] }));
      sinon.assert.calledOnce(injectorMock.dispose);
    });

    it('should dispose the temporary directory after a failed mutation test run', async () => {
      arrangeStartSocket();
      await sut.start();
      strykerRunStub.rejects(new Error('Foobar'));
      injectorMock.dispose.returns(Promise.resolve());

      await finalize(sut.mutationTest({ files: [{ path: 'foo.js' }] }));
      sinon.assert.calledOnce(injectorMock.dispose);
    });
  });

  describe('stdio channel', () => {
    beforeEach(() => {
      sut = new StrykerServer(
        { channel: 'stdio' },
        cliOptions,
        () => injectorMock,
      );
    });

    it('should handle mutationTest RPC and send progress notifications over stdout', async () => {
      // Arrange
      const mutantResult: MutantResult = {
        fileName: 'foo.js',
        id: '1',
        status: 'Killed',
        replacement: 'mutatedCode',
        location: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
        mutatorName: 'TestMutator',
      };
      sinon.stub(sut, 'mutationTest').returns(
        new Observable<MutantResult>((observer) => {
          observer.next(mutantResult);
          observer.complete();
        }),
      );
      const expectedReportMutationTestProgressNotification =
        'Content-Length: 256\r\n\r\n{"jsonrpc":"2.0","method":"reportMutationTestProgress","params":{"files":{"foo.js":{"mutants":[{"id":"1","status":"Killed","replacement":"mutatedCode","location":{"start":{"line":1,"column":0},"end":{"line":1,"column":10}},"mutatorName":"TestMutator"}]}}}}';
      const stdoutFake = arrangeStdioChannel([
        Buffer.from(
          JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'mutationTest',
            params: {},
          }),
        ),
      ]);
      let actualMsg = '';
      stdoutFake.on('data', (chunk) => {
        actualMsg += chunk.toString();
      });
      await sut.start();
      await tick();

      expect(actualMsg).eq(expectedReportMutationTestProgressNotification);
    });
  });
});

function finalize(ob: Observable<unknown>): Promise<void> {
  return new Promise((resolve) => {
    ob.subscribe({
      complete: resolve,
      error: () => {
        resolve();
      },
    });
  });
}
