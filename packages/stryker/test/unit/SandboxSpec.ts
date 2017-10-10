import { Mutant } from 'stryker-api/mutant';
import { Config } from 'stryker-api/config';
import * as sinon from 'sinon';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import { expect } from 'chai';
import { FileKind, File } from 'stryker-api/core';
import { RunResult } from 'stryker-api/test_runner';
import { TextFile } from 'stryker-api/src/core/File';
import { wrapInClosure } from '../../src/utils/objectUtils';
import Sandbox from '../../src/Sandbox';
import { TempFolder } from '../../src/utils/TempFolder';
import ResilientTestRunnerFactory from '../../src/isolated-runner/ResilientTestRunnerFactory';
import IsolatedRunnerOptions from '../../src/isolated-runner/IsolatedRunnerOptions';
import TestableMutant from '../../src/TestableMutant';
import { mutant as createMutant, testResult, textFile, fileDescriptor, webFile, transpileResult } from '../helpers/producers';
import SourceFile from '../../src/SourceFile';
import '../helpers/globals';
import TranspiledMutant from '../../src/TranspiledMutant';
import * as fileUtils from '../../src/utils/fileUtils';

describe('Sandbox', () => {
  let sut: Sandbox;
  let options: Config;
  let textFiles: TextFile[];
  let files: File[];
  let testRunner: any;
  let testFrameworkStub: any;
  let expectedFileToMutate: TextFile;
  let notMutatedFile: TextFile;
  let webFileUrl: string;
  let workingFolder: string;
  let expectedTargetFileToMutate: string;
  let expectedTestFrameworkHooksFile: string;

  beforeEach(() => {
    options = { port: 43, timeoutFactor: 23, timeoutMs: 1000, testRunner: 'sandboxUnitTestRunner' } as any;
    testRunner = { init: sandbox.stub(), run: sandbox.stub().resolves() };
    testFrameworkStub = {
      filter: sandbox.stub()
    };
    expectedFileToMutate = textFile({ name: path.resolve('file1'), content: 'original code', mutated: true, included: true });
    notMutatedFile = textFile({ name: path.resolve('file2'), content: 'to be mutated', mutated: false, included: false });
    webFileUrl = 'https://ajax.googleapis.com/ajax/libs/angularjs/1.3.12/angular.js';
    workingFolder = 'random-folder-3';
    expectedTargetFileToMutate = path.join(workingFolder, 'file1');
    expectedTestFrameworkHooksFile = path.join(workingFolder, '___testHooksForStryker.js');
    textFiles = [
      expectedFileToMutate,
      notMutatedFile,
    ];
    files = (textFiles as File[]).concat([webFile({ name: webFileUrl, mutated: false, included: true, transpiled: false })]);
    sandbox.stub(TempFolder.instance(), 'createRandomFolder').returns(workingFolder);
    sandbox.stub(fileUtils, 'writeFile').resolves();
    sandbox.stub(mkdirp, 'sync').returns('');
    sandbox.stub(ResilientTestRunnerFactory, 'create').returns(testRunner);
  });

  it('should copy input files when created', async () => {
    sut = await Sandbox.create(options, 3, files, null);
    expect(fileUtils.writeFile).calledWith(expectedTargetFileToMutate, textFiles[0].content);
    expect(fileUtils.writeFile).calledWith(path.join(workingFolder, 'file2'), textFiles[1].content);
  });

  it('should copy a local file when created', async () => {
    sut = await Sandbox.create(options, 3, [textFile({ name: 'localFile.js', content: 'foobar' })], null);
    expect(fileUtils.writeFile).calledWith(path.join(workingFolder, 'localFile.js'), 'foobar');
  });

  describe('when constructed with a testFramework', () => {

    beforeEach(async () => {
      sut = await Sandbox.create(options, 3, files, testFrameworkStub);
    });

    it('should not have written online files', () => {
      let expectedBaseFolder = webFileUrl.substr(workingFolder.length - 1); // The Sandbox expects all files to be absolute paths. An online file is not an absolute path.

      expect(mkdirp.sync).not.calledWith(workingFolder + path.dirname(expectedBaseFolder));
      expect(fileUtils.writeFile).not.calledWith(webFileUrl, sinon.match.any, sinon.match.any);
    });

    it('should have created a workingFolder', () => {
      expect(TempFolder.instance().createRandomFolder).to.have.been.calledWith('sandbox');
    });

    it('should have created the isolated test runner without framework hook', () => {
      const expectedSettings: IsolatedRunnerOptions = {
        files: [
          fileDescriptor({ name: expectedTestFrameworkHooksFile, mutated: false, included: true, transpiled: false }),
          fileDescriptor({ name: expectedTargetFileToMutate, mutated: true, included: true }),
          fileDescriptor({ name: path.join(workingFolder, 'file2'), mutated: false, included: false }),
          fileDescriptor({ name: webFileUrl, mutated: false, included: true, kind: FileKind.Web, transpiled: false })
        ],
        port: 46,
        strykerOptions: options,
        sandboxWorkingFolder: workingFolder
      };
      expect(ResilientTestRunnerFactory.create).calledWith(options.testRunner, expectedSettings);
    });

    describe('when run', () => {
      it('should run the testRunner', () => sut.run(231313).then(() => expect(testRunner.run).to.have.been.calledWith({ timeout: 231313 })));
    });

    describe('when runMutant()', () => {
      let transpiledMutant: TranspiledMutant;
      let actualRunResult: RunResult;
      let mutant: Mutant;
      let sourceFile: SourceFile;
      const testFilterCodeFragment = 'Some code fragment';

      beforeEach(() => {
        mutant = createMutant({ fileName: expectedFileToMutate.name, replacement: 'mutated', range: [0, 8] });
        sourceFile = new SourceFile(textFile({ content: 'original code' }));

        const testableMutant = new TestableMutant(
          mutant,
          new SourceFile(textFile({ content: 'original code' })));
        testableMutant.addTestResult(1, testResult({ timeSpentMs: 10 }));
        testableMutant.addTestResult(2, testResult({ timeSpentMs: 2 }));
        transpiledMutant = new TranspiledMutant(testableMutant, {
          error: null,
          outputFiles: [textFile({ name: expectedFileToMutate.name, content: 'mutated code' })]
        });
        testFrameworkStub.filter.returns(testFilterCodeFragment);
      });

      describe('when mutant has scopedTestIds', () => {

        beforeEach(async () => {
          actualRunResult = await sut.runMutant(transpiledMutant);
        });

        it('should save the mutant to disk', () => {
          expect(fileUtils.writeFile).to.have.been.calledWith(expectedTargetFileToMutate, 'mutated code');
        });

        it('should filter the scoped tests', () => {
          expect(testFrameworkStub.filter).to.have.been.calledWith(transpiledMutant.mutant.scopedTestIds);
        });

        it('should write the filter code fragment to hooks file', () => {
          expect(fileUtils.writeFile).calledWith(expectedTestFrameworkHooksFile, wrapInClosure(testFilterCodeFragment));
        });

        it('should have ran testRunner with correct timeout', () => {
          expect(testRunner.run).calledWith({ timeout: 12 * 23 + 1000 });
        });

        it('should have reset the source file', () => {
          expect(fileUtils.writeFile).to.have.been.calledWith(expectedTargetFileToMutate, 'original code');
        });
      });
    });
  });

  describe('when constructed without a testFramework', () => {
    beforeEach(async () => {
      sut = await Sandbox.create(options, 3, files, null);
    });


    it('should have created the isolated test runner', () => {
      const expectedSettings: IsolatedRunnerOptions = {
        files: [
          fileDescriptor({ name: path.join(workingFolder, 'file1'), mutated: true, included: true }),
          fileDescriptor({ name: path.join(workingFolder, 'file2'), mutated: false, included: false }),
          fileDescriptor({ name: webFileUrl, mutated: false, included: true, transpiled: false, kind: FileKind.Web })
        ],
        port: 46,
        strykerOptions: options,
        sandboxWorkingFolder: workingFolder
      };
      expect(ResilientTestRunnerFactory.create).to.have.been.calledWith(options.testRunner, expectedSettings);
    });

    describe('when runMutant()', () => {

      beforeEach(() => {
        const mutant = new TestableMutant(createMutant(), new SourceFile(textFile()));
        return sut.runMutant(new TranspiledMutant(mutant, transpileResult({ outputFiles: [textFile({ name: expectedTargetFileToMutate })] })));
      });

      it('should not filter any tests', () => {
        expect(fileUtils.writeFile).not.calledWith(expectedTestFrameworkHooksFile);
      });
    });
  });
});