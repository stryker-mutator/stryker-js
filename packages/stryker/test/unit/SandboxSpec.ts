import { Logger } from 'log4js';
import { Mutant } from 'stryker-api/mutant';
import { Config } from 'stryker-api/config';
import * as sinon from 'sinon';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import { expect } from 'chai';
import { File } from 'stryker-api/core';
import { wrapInClosure } from '../../src/utils/objectUtils';
import Sandbox from '../../src/Sandbox';
import { TempFolder } from '../../src/utils/TempFolder';
import ResilientTestRunnerFactory from '../../src/isolated-runner/ResilientTestRunnerFactory';
import IsolatedRunnerOptions from '../../src/isolated-runner/IsolatedRunnerOptions';
import TestableMutant, { TestSelectionResult } from '../../src/TestableMutant';
import { mutant as createMutant, testResult, Mock } from '../helpers/producers';
import SourceFile from '../../src/SourceFile';
import '../helpers/globals';
import TranspiledMutant from '../../src/TranspiledMutant';
import * as fileUtils from '../../src/utils/fileUtils';
import currentLogMock from '../helpers/log4jsMock';
import TestRunnerDecorator from '../../src/isolated-runner/TestRunnerDecorator';

describe('Sandbox', () => {
  let sut: Sandbox;
  let options: Config;
  let files: File[];
  let testRunner: Mock<TestRunnerDecorator>;
  let testFrameworkStub: any;
  let expectedFileToMutate: File;
  let notMutatedFile: File;
  let workingFolder: string;
  let expectedTargetFileToMutate: string;
  let expectedTestFrameworkHooksFile: string;
  let fileSystemStub: sinon.SinonStub;
  let log: Mock<Logger>;

  beforeEach(() => {
    options = { port: 43, timeoutFactor: 23, timeoutMs: 1000, testRunner: 'sandboxUnitTestRunner' } as any;
    testRunner = { init: sandbox.stub(), run: sandbox.stub().resolves(), dispose: sandbox.stub() };
    testFrameworkStub = {
      filter: sandbox.stub()
    };
    expectedFileToMutate = new File(path.resolve('file1'), 'original code');
    notMutatedFile = new File(path.resolve('file2'), 'to be mutated');
    workingFolder = path.resolve('random-folder-3');
    expectedTargetFileToMutate = path.join(workingFolder, 'file1');
    expectedTestFrameworkHooksFile = path.join(workingFolder, '___testHooksForStryker.js');
    files = [
      expectedFileToMutate,
      notMutatedFile,
    ];
    sandbox.stub(TempFolder.instance(), 'createRandomFolder').returns(workingFolder);
    fileSystemStub = sandbox.stub(fileUtils, 'writeFile');
    fileSystemStub.resolves();
    sandbox.stub(mkdirp, 'sync').returns('');
    sandbox.stub(ResilientTestRunnerFactory, 'create').returns(testRunner);
    log = currentLogMock();
  });

  it('should copy input files when created', async () => {
    sut = await Sandbox.create(options, 3, files, null);
    expect(fileUtils.writeFile).calledWith(expectedTargetFileToMutate, files[0].content);
    expect(fileUtils.writeFile).calledWith(path.join(workingFolder, 'file2'), files[1].content);
  });

  it('should copy a local file when created', async () => {
    sut = await Sandbox.create(options, 3, [new File('localFile.js', 'foobar')], null);
    expect(fileUtils.writeFile).calledWith(path.join(workingFolder, 'localFile.js'), Buffer.from('foobar'));
  });

  describe('when constructed with a testFramework', () => {

    beforeEach(async () => {
      sut = await Sandbox.create(options, 3, files, testFrameworkStub);
    });

    it('should have created a workingFolder', () => {
      expect(TempFolder.instance().createRandomFolder).to.have.been.calledWith('sandbox');
    });

    it('should have created the isolated test runner without framework hook', () => {
      const expectedSettings: IsolatedRunnerOptions = {
        port: 46,
        strykerOptions: options,
        sandboxWorkingFolder: workingFolder,
        fileNames: [path.resolve('random-folder-3', 'file1'), path.resolve('random-folder-3', 'file2')]
      };
      expect(ResilientTestRunnerFactory.create).calledWith(options.testRunner, expectedSettings);
    });

    describe('when run', () => {
      it('should run the testRunner', async () => {
        await sut.run(231313, 'hooks');
        expect(testRunner.run).to.have.been.calledWith({
          timeout: 231313,
          testHooks: 'hooks'
        });
      });
    });

    describe('when runMutant()', () => {
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
        await sut.runMutant(transpiledMutant);
        expect(fileUtils.writeFile).calledWith(expectedTargetFileToMutate, Buffer.from('mutated code'));
        expect(log.warn).not.called;
      });

      it('should nog log a warning if test selection was failed but already reported', async () => {
        transpiledMutant.mutant.testSelectionResult = TestSelectionResult.FailedButAlreadyReported;
        await sut.runMutant(transpiledMutant);
        expect(log.warn).not.called;
      });

      it('should log a warning if tests could not have been selected', async () => {
        transpiledMutant.mutant.testSelectionResult = TestSelectionResult.Failed;
        await sut.runMutant(transpiledMutant);
        const expectedLogMessage = `Failed find coverage data for this mutant, running all tests. This might have an impact on performance: ${transpiledMutant.mutant.toString()}`;
        expect(log.warn).calledWith(expectedLogMessage);
      });

      it('should filter the scoped tests', async () => {
        await sut.runMutant(transpiledMutant);
        expect(testFrameworkStub.filter).to.have.been.calledWith(transpiledMutant.mutant.selectedTests);
      });

      it('should provide the filter code as testHooks and correct timeout', async () => {
        await sut.runMutant(transpiledMutant);
        const expectedRunOptions = { testHooks: wrapInClosure(testFilterCodeFragment), timeout: 12 * 23 + 1000 };
        expect(testRunner.run).calledWith(expectedRunOptions);
      });

      it('should have reset the source file', async () => {
        await sut.runMutant(transpiledMutant);

        let timesCalled = fileSystemStub.getCalls().length - 1;
        let lastCall = fileSystemStub.getCall(timesCalled);
        expect(lastCall.args).to.deep.equal([expectedTargetFileToMutate, Buffer.from('original code')]);
      });
    });
  });

  describe('when constructed without a testFramework', () => {
    beforeEach(async () => {
      sut = await Sandbox.create(options, 3, files, null);
    });


    it('should have created the isolated test runner', () => {
      const expectedSettings: IsolatedRunnerOptions = {
        port: 46,
        strykerOptions: options,
        sandboxWorkingFolder: workingFolder,
        fileNames: [path.resolve('random-folder-3', 'file1'), path.resolve('random-folder-3', 'file2')]
      };
      expect(ResilientTestRunnerFactory.create).to.have.been.calledWith(options.testRunner, expectedSettings);
    });

    describe('when runMutant()', () => {

      beforeEach(() => {
        const mutant = new TestableMutant('2', createMutant(), new SourceFile(new File('', '')));
        return sut.runMutant(new TranspiledMutant(mutant, { outputFiles: [new File(expectedTargetFileToMutate, '')], error: null }, true));
      });

      it('should not filter any tests', () => {
        expect(fileUtils.writeFile).not.calledWith(expectedTestFrameworkHooksFile);
      });
    });
  });
});