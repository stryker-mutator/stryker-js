import { Logger } from 'stryker-api/logging';
import { Mutant } from 'stryker-api/mutant';
import { Config } from 'stryker-api/config';
import * as sinon from 'sinon';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import { expect } from 'chai';
import { File } from 'stryker-api/core';
import { wrapInClosure, normalizeWhiteSpaces } from '../../src/utils/objectUtils';
import Sandbox from '../../src/Sandbox';
import { TempFolder } from '../../src/utils/TempFolder';
import ResilientTestRunnerFactory from '../../src/isolated-runner/ResilientTestRunnerFactory';
import IsolatedRunnerOptions from '../../src/isolated-runner/IsolatedRunnerOptions';
import TestableMutant, { TestSelectionResult } from '../../src/TestableMutant';
import { mutant as createMutant, testResult, Mock, createFileAlreadyExistsError } from '../helpers/producers';
import SourceFile from '../../src/SourceFile';
import '../helpers/globals';
import TranspiledMutant from '../../src/TranspiledMutant';
import * as fileUtils from '../../src/utils/fileUtils';
import currentLogMock from '../helpers/logMock';
import TestRunnerDecorator from '../../src/isolated-runner/TestRunnerDecorator';

const OVERHEAD_TIME_MS = 0;
const SANDBOX_INDEX = 3;

describe('Sandbox', () => {
  let options: Config;
  let files: File[];
  let testRunner: Mock<TestRunnerDecorator>;
  let testFrameworkStub: any;
  let expectedFileToMutate: File;
  let notMutatedFile: File;
  let sandboxFolder: string;
  let expectedTargetFileToMutate: string;
  let expectedTestFrameworkHooksFile: string;
  let writeFileStub: sinon.SinonStub;
  let symlinkJunctionStub: sinon.SinonStub;
  let findNodeModulesStub: sinon.SinonStub;
  let log: Mock<Logger>;

  beforeEach(() => {
    options = { port: 43, timeoutFactor: 23, timeoutMs: 1000, testRunner: 'sandboxUnitTestRunner', symlinkNodeModules: true } as any;
    testRunner = { init: sandbox.stub(), run: sandbox.stub().resolves(), dispose: sandbox.stub() };
    testFrameworkStub = {
      filter: sandbox.stub()
    };
    expectedFileToMutate = new File(path.resolve('file1'), 'original code');
    notMutatedFile = new File(path.resolve('file2'), 'to be mutated');
    sandboxFolder = path.resolve('random-folder-3');
    expectedTargetFileToMutate = path.join(sandboxFolder, 'file1');
    expectedTestFrameworkHooksFile = path.join(sandboxFolder, '___testHooksForStryker.js');
    files = [
      expectedFileToMutate,
      notMutatedFile,
    ];
    sandbox.stub(TempFolder.instance(), 'createRandomFolder').returns(sandboxFolder);
    writeFileStub = sandbox.stub(fileUtils, 'writeFile');
    symlinkJunctionStub = sandbox.stub(fileUtils, 'symlinkJunction');
    findNodeModulesStub = sandbox.stub(fileUtils, 'findNodeModules');
    symlinkJunctionStub.resolves();
    findNodeModulesStub.resolves('node_modules');
    writeFileStub.resolves();
    sandbox.stub(mkdirp, 'sync').returns('');
    sandbox.stub(ResilientTestRunnerFactory, 'create').returns(testRunner);
    log = currentLogMock();
  });


  describe('create()', () => {

    it('should copy input files when created', async () => {
      await Sandbox.create(options, SANDBOX_INDEX, files, null, OVERHEAD_TIME_MS);
      expect(fileUtils.writeFile).calledWith(expectedTargetFileToMutate, files[0].content);
      expect(fileUtils.writeFile).calledWith(path.join(sandboxFolder, 'file2'), files[1].content);
    });

    it('should copy a local file when created', async () => {
      await Sandbox.create(options, SANDBOX_INDEX, [new File('localFile.js', 'foobar')], null, OVERHEAD_TIME_MS);
      expect(fileUtils.writeFile).calledWith(path.join(sandboxFolder, 'localFile.js'), Buffer.from('foobar'));
    });

    it('should have created the isolated test runner', async () => {
      await Sandbox.create(options, SANDBOX_INDEX, files, null, OVERHEAD_TIME_MS);
      const expectedSettings: IsolatedRunnerOptions = {
        port: 46,
        strykerOptions: options,
        sandboxWorkingFolder: sandboxFolder,
        fileNames: [path.resolve('random-folder-3', 'file1'), path.resolve('random-folder-3', 'file2')]
      };
      expect(ResilientTestRunnerFactory.create).to.have.been.calledWith(options.testRunner, expectedSettings);
    });

    it('should have created a sandbox folder', async () => {
      await Sandbox.create(options, SANDBOX_INDEX, files, testFrameworkStub, OVERHEAD_TIME_MS);
      expect(TempFolder.instance().createRandomFolder).to.have.been.calledWith('sandbox');
    });

    it('should symlink node modules in sandbox directory if exists', async () => {
      await Sandbox.create(options, SANDBOX_INDEX, files, testFrameworkStub, OVERHEAD_TIME_MS);
      expect(findNodeModulesStub).calledWith(process.cwd());
      expect(symlinkJunctionStub).calledWith('node_modules', path.join(sandboxFolder, 'node_modules'));
    });

    it('should not symlink node modules in sandbox directory if no node_modules exist', async () => {
      findNodeModulesStub.resolves(null);
      await Sandbox.create(options, SANDBOX_INDEX, files, testFrameworkStub, OVERHEAD_TIME_MS);
      expect(log.warn).calledWithMatch('Could not find a node_modules');
      expect(log.warn).calledWithMatch(process.cwd());
      expect(symlinkJunctionStub).not.called;
    });

    it('should log a warning if "node_modules" already exists in the working folder', async () => {
      findNodeModulesStub.resolves('node_modules');
      symlinkJunctionStub.rejects(createFileAlreadyExistsError());
      await Sandbox.create(options, SANDBOX_INDEX, files, testFrameworkStub, OVERHEAD_TIME_MS);
      expect(log.warn).calledWithMatch(normalizeWhiteSpaces(
        `Could not symlink "node_modules" in sandbox directory, it is already created in the sandbox. 
        Please remove the node_modules from your sandbox files. Alternatively, set \`symlinkNodeModules\` 
        to \`false\` to disable this warning.`));
    });

    it('should log a warning if linking "node_modules" results in an unknown error', async () => {
      findNodeModulesStub.resolves('basePath/node_modules');
      const error = new Error('unknown');
      symlinkJunctionStub.rejects(error);
      await Sandbox.create(options, SANDBOX_INDEX, files, testFrameworkStub, OVERHEAD_TIME_MS);
      expect(log.warn).calledWithMatch(normalizeWhiteSpaces(
        `Unexpected error while trying to symlink "basePath/node_modules" in sandbox directory.`), error);
    });

    it('should symlink node modules in sandbox directory if `symlinkNodeModules` is `false`', async () => {
      options.symlinkNodeModules = false;
      await Sandbox.create(options, SANDBOX_INDEX, files, testFrameworkStub, OVERHEAD_TIME_MS);
      expect(symlinkJunctionStub).not.called;
      expect(findNodeModulesStub).not.called;
    });
  });

  describe('run()', () => {
    it('should run the testRunner', async () => {
      const sut = await Sandbox.create(options, SANDBOX_INDEX, files, null, 0);
      await sut.run(231313, 'hooks');
      expect(testRunner.run).to.have.been.calledWith({
        timeout: 231313,
        testHooks: 'hooks'
      });
    });
  });

  describe('runMutant()', () => {
    let transpiledMutant: TranspiledMutant;
    let mutant: Mutant;
    const testFilterCodeFragment = 'Some code fragment';

    beforeEach(() => {
      mutant = createMutant({ fileName: expectedFileToMutate.name, replacement: 'mutated', range: [0, 8] });

      const testableMutant = new TestableMutant(
        '1',
        mutant,
        new SourceFile(new File('foobar.js', 'original code')));
      testableMutant.selectTest(testResult({ timeSpentMs: 10 }), 1);
      testableMutant.selectTest(testResult({ timeSpentMs: 2 }), 2);
      transpiledMutant = new TranspiledMutant(testableMutant, { outputFiles: [new File(expectedFileToMutate.name, 'mutated code')], error: null }, true);
      testFrameworkStub.filter.returns(testFilterCodeFragment);
    });

    it('should save the mutant to disk', async () => {
      const sut = await Sandbox.create(options, SANDBOX_INDEX, files, null, OVERHEAD_TIME_MS);
      await sut.runMutant(transpiledMutant);
      expect(fileUtils.writeFile).calledWith(expectedTargetFileToMutate, Buffer.from('mutated code'));
      expect(log.warn).not.called;
    });

    it('should nog log a warning if test selection was failed but already reported', async () => {
      const sut = await Sandbox.create(options, SANDBOX_INDEX, files, null, OVERHEAD_TIME_MS);
      transpiledMutant.mutant.testSelectionResult = TestSelectionResult.FailedButAlreadyReported;
      await sut.runMutant(transpiledMutant);
      expect(log.warn).not.called;
    });

    it('should log a warning if tests could not have been selected', async () => {
      const sut = await Sandbox.create(options, SANDBOX_INDEX, files, null, OVERHEAD_TIME_MS);
      transpiledMutant.mutant.testSelectionResult = TestSelectionResult.Failed;
      await sut.runMutant(transpiledMutant);
      const expectedLogMessage = `Failed find coverage data for this mutant, running all tests. This might have an impact on performance: ${transpiledMutant.mutant.toString()}`;
      expect(log.warn).calledWith(expectedLogMessage);
    });

    it('should filter the scoped tests', async () => {
      const sut = await Sandbox.create(options, SANDBOX_INDEX, files, testFrameworkStub, OVERHEAD_TIME_MS);
      await sut.runMutant(transpiledMutant);
      expect(testFrameworkStub.filter).to.have.been.calledWith(transpiledMutant.mutant.selectedTests);
    });

    it('should provide the filter code as testHooks and correct timeout', async () => {
      options.timeoutMs = 1000;
      const overheadTimeMS = 42;
      const totalTimeSpend = 12;
      const sut = await Sandbox.create(options, SANDBOX_INDEX, files, testFrameworkStub, overheadTimeMS);
      await sut.runMutant(transpiledMutant);
      const expectedRunOptions = { testHooks: wrapInClosure(testFilterCodeFragment), timeout: totalTimeSpend * options.timeoutFactor + options.timeoutMs + overheadTimeMS };
      expect(testRunner.run).calledWith(expectedRunOptions);
    });

    it('should have reset the source file', async () => {
      const sut = await Sandbox.create(options, SANDBOX_INDEX, files, null, OVERHEAD_TIME_MS);
      await sut.runMutant(transpiledMutant);
      let timesCalled = writeFileStub.getCalls().length - 1;
      let lastCall = writeFileStub.getCall(timesCalled);
      expect(lastCall.args).to.deep.equal([expectedTargetFileToMutate, Buffer.from('original code')]);
    });

    it('should not filter any tests when testFramework = null', async () => {
      const sut = await Sandbox.create(options, SANDBOX_INDEX, files, null, OVERHEAD_TIME_MS);
      const mutant = new TestableMutant('2', createMutant(), new SourceFile(new File('', '')));
      sut.runMutant(new TranspiledMutant(mutant, { outputFiles: [new File(expectedTargetFileToMutate, '')], error: null }, true));
      expect(fileUtils.writeFile).not.calledWith(expectedTestFrameworkHooksFile);
    });

  });
});
