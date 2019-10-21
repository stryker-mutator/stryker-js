import { Config } from '@stryker-mutator/api/config';
import { File, LogLevel } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { Mutant } from '@stryker-mutator/api/mutant';
import { MutantStatus } from '@stryker-mutator/api/report';
import { TestFramework } from '@stryker-mutator/api/test_framework';
import { RunResult, RunStatus } from '@stryker-mutator/api/test_runner';
import { mutant as createMutant, fileAlreadyExistsError, testResult } from '@stryker-mutator/test-helpers/src/factory';
import { normalizeWhitespaces } from '@stryker-mutator/util';
import { expect } from 'chai';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import * as sinon from 'sinon';
import LoggingClientContext from '../../src/logging/LoggingClientContext';
import Sandbox from '../../src/Sandbox';
import SourceFile from '../../src/SourceFile';
import ResilientTestRunnerFactory from '../../src/test-runner/ResilientTestRunnerFactory';
import TestRunnerDecorator from '../../src/test-runner/TestRunnerDecorator';
import TestableMutant, { TestSelectionResult } from '../../src/TestableMutant';
import TranspiledMutant from '../../src/TranspiledMutant';
import * as fileUtils from '../../src/utils/fileUtils';
import { wrapInClosure } from '../../src/utils/objectUtils';
import { TemporaryDirectory } from '../../src/utils/TemporaryDirectory';
import currentLogMock from '../helpers/logMock';
import { Mock } from '../helpers/producers';

const OVERHEAD_TIME_MS = 0;
const LOGGING_CONTEXT: LoggingClientContext = Object.freeze({
  level: LogLevel.Fatal,
  port: 4200
});
const SANDBOX_INDEX = 3;

describe(Sandbox.name, () => {
  let options: Config;
  let inputFiles: File[];
  let testRunner: Mock<TestRunnerDecorator>;
  let testFrameworkStub: any;
  let expectedFileToMutate: File;
  let notMutatedFile: File;
  let sandboxDirectory: string;
  let expectedTargetFileToMutate: string;
  let expectedTestFrameworkHooksFile: string;
  let writeFileStub: sinon.SinonStub;
  let symlinkJunctionStub: sinon.SinonStub;
  let findNodeModulesStub: sinon.SinonStub;
  let log: Mock<Logger>;
  let runResult: RunResult;
  let temporaryDirectoryMock: sinon.SinonStubbedInstance<TemporaryDirectory>;

  beforeEach(() => {
    runResult = { tests: [], status: RunStatus.Complete };
    options = { timeoutFactor: 23, timeoutMS: 1000, testRunner: 'sandboxUnitTestRunner', symlinkNodeModules: true } as any;
    testRunner = { init: sinon.stub(), run: sinon.stub().resolves(runResult), dispose: sinon.stub() };
    testFrameworkStub = {
      filter: sinon.stub()
    };
    expectedFileToMutate = new File(path.resolve('file1'), 'original code');
    notMutatedFile = new File(path.resolve('file2'), 'to be mutated');
    sandboxDirectory = path.resolve('random-folder-3');
    expectedTargetFileToMutate = path.join(sandboxDirectory, 'file1');
    expectedTestFrameworkHooksFile = path.join(sandboxDirectory, '___testHooksForStryker.js');
    inputFiles = [expectedFileToMutate, notMutatedFile];
    temporaryDirectoryMock = sinon.createStubInstance(TemporaryDirectory);
    temporaryDirectoryMock.createRandomDirectory.returns(sandboxDirectory);

    writeFileStub = sinon.stub(fileUtils, 'writeFile');
    symlinkJunctionStub = sinon.stub(fileUtils, 'symlinkJunction');
    findNodeModulesStub = sinon.stub(fileUtils, 'findNodeModules');
    symlinkJunctionStub.resolves();
    findNodeModulesStub.resolves('node_modules');
    writeFileStub.resolves();
    sinon.stub(mkdirp, 'sync').returns('');
    sinon.stub(ResilientTestRunnerFactory, 'create').returns(testRunner);
    log = currentLogMock();
    log.isDebugEnabled.returns(true);
  });

  interface CreateArgs {
    testFramework: TestFramework | null;
    overheadTimeMS: number;
    files: readonly File[];
  }
  function createSut(overrides?: Partial<CreateArgs>) {
    const args: CreateArgs = {
      files: inputFiles,
      overheadTimeMS: OVERHEAD_TIME_MS,
      testFramework: null
    };
    const { files, testFramework, overheadTimeMS } = { ...args, ...overrides };
    return Sandbox.create(options, SANDBOX_INDEX, files, testFramework, overheadTimeMS, LOGGING_CONTEXT, temporaryDirectoryMock as any);
  }

  describe('create()', () => {
    it('should copy input files when created', async () => {
      await createSut();
      expect(fileUtils.writeFile).calledWith(expectedTargetFileToMutate, inputFiles[0].content);
      expect(fileUtils.writeFile).calledWith(path.join(sandboxDirectory, 'file2'), inputFiles[1].content);
    });

    it('should copy a local file when created', async () => {
      await createSut({ files: [new File('localFile.js', 'foobar')] });
      expect(fileUtils.writeFile).calledWith(path.join(sandboxDirectory, 'localFile.js'), Buffer.from('foobar'));
    });

    it('should have created the isolated test runner', async () => {
      await createSut();
      const expectedFileNames = inputFiles.map(file => path.resolve(sandboxDirectory, path.basename(file.name)));
      expect(ResilientTestRunnerFactory.create).calledWith(options, expectedFileNames, sandboxDirectory, LOGGING_CONTEXT);
    });

    it('should have created a sandbox folder', async () => {
      await createSut(testFrameworkStub);
      expect(temporaryDirectoryMock.createRandomDirectory).calledWith('sandbox');
    });

    it('should symlink node modules in sandbox directory if exists', async () => {
      await createSut(testFrameworkStub);
      expect(findNodeModulesStub).calledWith(process.cwd());
      expect(symlinkJunctionStub).calledWith('node_modules', path.join(sandboxDirectory, 'node_modules'));
    });

    it('should not symlink node modules in sandbox directory if no node_modules exist', async () => {
      findNodeModulesStub.resolves(null);
      await createSut(testFrameworkStub);
      expect(log.warn).calledWithMatch('Could not find a node_modules');
      expect(log.warn).calledWithMatch(process.cwd());
      expect(symlinkJunctionStub).not.called;
    });

    it('should log a warning if "node_modules" already exists in the working folder', async () => {
      findNodeModulesStub.resolves('node_modules');
      symlinkJunctionStub.rejects(fileAlreadyExistsError());
      await createSut(testFrameworkStub);
      expect(log.warn).calledWithMatch(
        normalizeWhitespaces(
          `Could not symlink "node_modules" in sandbox directory, it is already created in the sandbox.
        Please remove the node_modules from your sandbox files. Alternatively, set \`symlinkNodeModules\`
        to \`false\` to disable this warning.`
        )
      );
    });

    it('should log a warning if linking "node_modules" results in an unknown error', async () => {
      findNodeModulesStub.resolves('basePath/node_modules');
      const error = new Error('unknown');
      symlinkJunctionStub.rejects(error);
      await createSut(testFrameworkStub);
      expect(log.warn).calledWithMatch(
        normalizeWhitespaces('Unexpected error while trying to symlink "basePath/node_modules" in sandbox directory.'),
        error
      );
    });

    it('should symlink node modules in sandbox directory if `symlinkNodeModules` is `false`', async () => {
      options.symlinkNodeModules = false;
      await createSut(testFrameworkStub);
      expect(symlinkJunctionStub).not.called;
      expect(findNodeModulesStub).not.called;
    });
  });

  describe('run()', () => {
    it('should run the testRunner', async () => {
      const sut = await createSut();
      await sut.run(231313, 'hooks');
      expect(testRunner.run).to.have.been.calledWith({
        mutatedFileName: undefined,
        testHooks: 'hooks',
        timeout: 231313
      });
    });

    it('should run the testRunner with mutatedFileName', async () => {
      const sut = await createSut();
      await sut.run(231313, 'hooks', 'path/to/file');
      expect(testRunner.run).to.have.been.calledWith({
        mutatedFileName: 'path/to/file',
        testHooks: 'hooks',
        timeout: 231313
      });
    });
  });

  describe('runMutant()', () => {
    let transpiledMutant: TranspiledMutant;
    let mutant: Mutant;
    const testFilterCodeFragment = 'Some code fragment';

    beforeEach(() => {
      mutant = createMutant({ fileName: expectedFileToMutate.name, replacement: 'mutated', range: [0, 8] });

      const testableMutant = new TestableMutant('1', mutant, new SourceFile(new File('foobar.js', 'original code')));
      testableMutant.selectTest(testResult({ timeSpentMs: 10 }), 1);
      testableMutant.selectTest(testResult({ timeSpentMs: 2 }), 2);
      transpiledMutant = new TranspiledMutant(
        testableMutant,
        { outputFiles: [new File(expectedFileToMutate.name, 'mutated code')], error: null },
        true
      );
      testFrameworkStub.filter.returns(testFilterCodeFragment);
    });

    it('should save the mutant to disk', async () => {
      const sut = await createSut();
      await sut.runMutant(transpiledMutant);
      expect(fileUtils.writeFile).calledWith(expectedTargetFileToMutate, Buffer.from('mutated code'));
      expect(log.warn).not.called;
    });

    it('should nog log a warning if test selection was failed but already reported', async () => {
      const sut = await createSut();
      transpiledMutant.mutant.testSelectionResult = TestSelectionResult.FailedButAlreadyReported;
      await sut.runMutant(transpiledMutant);
      expect(log.warn).not.called;
    });

    it('should log a warning if tests could not have been selected', async () => {
      const sut = await createSut();
      transpiledMutant.mutant.testSelectionResult = TestSelectionResult.Failed;
      await sut.runMutant(transpiledMutant);
      const expectedLogMessage = `Failed find coverage data for this mutant, running all tests. This might have an impact on performance: ${transpiledMutant.mutant.toString()}`;
      expect(log.warn).calledWith(expectedLogMessage);
    });

    it('should filter the scoped tests', async () => {
      const sut = await createSut({ testFramework: testFrameworkStub });
      await sut.runMutant(transpiledMutant);
      expect(testFrameworkStub.filter).to.have.been.calledWith(transpiledMutant.mutant.selectedTests);
    });

    it('should provide the filter code as testHooks, correct timeout and mutatedFileName', async () => {
      options.timeoutMS = 1000;
      const overheadTimeMS = 42;
      const totalTimeSpend = 12;
      const sut = await createSut({ overheadTimeMS, testFramework: testFrameworkStub });
      await sut.runMutant(transpiledMutant);
      const expectedRunOptions = {
        mutatedFileName: path.resolve('random-folder-3', 'file1'),
        testHooks: wrapInClosure(testFilterCodeFragment),
        timeout: totalTimeSpend * options.timeoutFactor + options.timeoutMS + overheadTimeMS
      };
      expect(testRunner.run).calledWith(expectedRunOptions);
    });

    it('should have reset the source file', async () => {
      const sut = await createSut();
      await sut.runMutant(transpiledMutant);
      const timesCalled = writeFileStub.getCalls().length - 1;
      const lastCall = writeFileStub.getCall(timesCalled);
      expect(lastCall.args).to.deep.equal([expectedTargetFileToMutate, Buffer.from('original code')]);
    });

    it('should not filter any tests when testFramework = null', async () => {
      const sut = await createSut();
      const mutant = new TestableMutant('2', createMutant(), new SourceFile(new File('', '')));
      await sut.runMutant(new TranspiledMutant(mutant, { outputFiles: [new File(expectedTargetFileToMutate, '')], error: null }, true));
      expect(fileUtils.writeFile).not.calledWith(expectedTestFrameworkHooksFile);
    });

    it('should not filter any tests when runAllTests = true', async () => {
      // Arrange
      while (transpiledMutant.mutant.selectedTests.pop());
      transpiledMutant.mutant.selectAllTests(runResult, TestSelectionResult.Success);
      const sut = await createSut();

      // Act
      await sut.runMutant(transpiledMutant);

      // Assert
      expect(fileUtils.writeFile).not.calledWith(expectedTestFrameworkHooksFile);
      expect(testRunner.run).called;
    });

    it('should not filter any tests when runAllTests = true', async () => {
      const sut = await createSut();
      const mutant = new TestableMutant('2', createMutant(), new SourceFile(new File('', '')));
      mutant.selectAllTests(runResult, TestSelectionResult.Failed);
      sut.runMutant(new TranspiledMutant(mutant, { outputFiles: [new File(expectedTargetFileToMutate, '')], error: null }, true));
      expect(fileUtils.writeFile).not.calledWith(expectedTestFrameworkHooksFile);
    });

    it('should report a runtime error when test run errored', async () => {
      runResult.status = RunStatus.Error;
      runResult.errorMessages = ['Cannot call "foo" of undefined (or something)'];
      const sut = await createSut();
      const actualResult = await sut.runMutant(transpiledMutant);
      expect(log.debug).calledWith(
        'A runtime error occurred: %s during execution of mutant: %s',
        runResult.errorMessages[0],
        transpiledMutant.mutant.toString()
      );
      expect(actualResult.status).eq(MutantStatus.RuntimeError);
    });

    it('should report an early result when there is a transpile error', async () => {
      transpiledMutant.transpileResult.error = 'Error! Cannot negate a string (or something)';
      const sut = await createSut();
      const mutantResult = await sut.runMutant(transpiledMutant);
      expect(log.debug).calledWith(
        `Transpile error occurred: "Error! Cannot negate a string (or something)" during transpiling of mutant ${transpiledMutant.mutant.toString()}`
      );
      expect(mutantResult.status).eq(MutantStatus.TranspileError);
    });

    it('should report an early result when there are no files scoped', async () => {
      // Arrange
      while (transpiledMutant.mutant.selectedTests.pop());

      // Act
      const sut = await createSut();

      // Assert
      const mutantResult = await sut.runMutant(transpiledMutant);
      expect(mutantResult.status).eq(MutantStatus.NoCoverage);
    });

    it('should report an early result when there are no file changes', async () => {
      transpiledMutant.changedAnyTranspiledFiles = false;
      const sut = await createSut();
      const mutantResult = await sut.runMutant(transpiledMutant);
      expect(mutantResult.status).eq(MutantStatus.Survived);
    });
  });
});
