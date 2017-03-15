import { Config } from 'stryker-api/config';
import * as sinon from 'sinon';
import * as path from 'path';
import { expect } from 'chai';
import { InputFile } from 'stryker-api/core';
import { RunResult } from 'stryker-api/test_runner';
import { wrapInClosure } from '../../src/utils/objectUtils';
import Sandbox from '../../src/Sandbox';
import StrykerTempFolder from '../../src/utils/StrykerTempFolder';
import ResilientTestRunnerFactory from '../../src/isolated-runner/ResilientTestRunnerFactory';
import IsolatedRunnerOptions from '../../src/isolated-runner/IsolatedRunnerOptions';

describe('Sandbox', () => {
  let sut: Sandbox;
  let options: Config;
  let sandbox: sinon.SinonSandbox;
  let files: InputFile[];
  let testRunner: any;
  let testFramework: any;
  const expectedFileToMutate: InputFile = { path: path.resolve('file1'), mutated: true, included: true };
  const notMutatedFile: InputFile = { path: path.resolve('file2'), mutated: false, included: false };
  const onlineFile = 'https://ajax.googleapis.com/ajax/libs/angularjs/1.3.12/angular.js';
  const workingFolder = 'random-folder-3';
  const expectedTargetFileToMutate = path.join(workingFolder, 'file1');
  const expectedTestFrameworkHooksFile = path.join(workingFolder, '___testHooksForStryker.js');

  beforeEach(() => {
    options = { port: 43, timeoutFactor: 23, timeoutMs: 1000, testRunner: 'sandboxUnitTestRunner' } as any;
    sandbox = sinon.sandbox.create();
    testRunner = { init: sandbox.stub(), run: sandbox.stub().returns(Promise.resolve()) };
    testFramework = {
      filter: sandbox.stub()
    };
    files = [
      expectedFileToMutate,
      notMutatedFile,
      { path: onlineFile, mutated: false, included: true }
    ];
    sandbox.stub(StrykerTempFolder, 'createRandomFolder').returns(workingFolder);
    sandbox.stub(StrykerTempFolder, 'ensureFolderExists').returnsArg(0);
    sandbox.stub(StrykerTempFolder, 'copyFile').returns(Promise.resolve({}));
    sandbox.stub(StrykerTempFolder, 'writeFile').returns(Promise.resolve({}));
    sandbox.stub(ResilientTestRunnerFactory, 'create').returns(testRunner);
  });

  afterEach(() => sandbox.restore());

  describe('when constructed with a CoverageInstrumenter', () => {

    let coverageInstrumenter: {
      instrumenterStreamForFile: sinon.SinonStub;
      hooksForTestRun: sinon.SinonStub;
    };
    let expectedInstrumenterStream: any;

    beforeEach(() => {
      expectedInstrumenterStream = 'an instrumenter stream';
      coverageInstrumenter = {
        instrumenterStreamForFile: sinon.stub(),
        hooksForTestRun: sinon.stub()
      };
      coverageInstrumenter.instrumenterStreamForFile.returns(expectedInstrumenterStream);
      sut = new Sandbox(options, 3, files, testFramework, <any>coverageInstrumenter);
    });

    describe('when initialize()', () => {

      beforeEach(() => sut.initialize());

      it('should have instrumented the input files', () => {
        expect(coverageInstrumenter.instrumenterStreamForFile).to.have.been.calledWith(expectedFileToMutate);
        expect(coverageInstrumenter.instrumenterStreamForFile).to.have.been.calledWith(expectedFileToMutate);
        expect(StrykerTempFolder.copyFile).to.have.been.calledWith(expectedFileToMutate.path, expectedTargetFileToMutate, expectedInstrumenterStream);
      });

      it('should not have copied online files', () => {
        let expectedBaseFolder = onlineFile.substr(workingFolder.length - 1); // The Sandbox expects all files to be absolute paths. An online file is not an absolute path.

        expect(StrykerTempFolder.ensureFolderExists).to.not.have.been.calledWith(workingFolder + path.dirname(expectedBaseFolder));
        expect(StrykerTempFolder.copyFile).to.not.have.been.calledWith(onlineFile, sinon.match.any, sinon.match.any);
      });
    });
  });

  describe('when constructed with a testFramework but without a CoverageInstrumenter', () => {

    beforeEach(() => sut = new Sandbox(options, 3, files, testFramework, null));

    it('should have created a workingFolder', () => expect(StrykerTempFolder.createRandomFolder).to.have.been.calledWith('sandbox'));

    describe('when initialized()', () => {

      beforeEach(() => sut.initialize());

      it('should have copied the input files', () => expect(StrykerTempFolder.copyFile).to.have.been.calledWith(files[0].path, expectedTargetFileToMutate)
        .and.calledWith(files[1].path, path.join(workingFolder, 'file2')));

      it('should have created the isolated test runner inc framework hook', () => {
        const expectedSettings: IsolatedRunnerOptions = {
          files: [
            { path: expectedTestFrameworkHooksFile, mutated: false, included: true },
            { path: expectedTargetFileToMutate, mutated: true, included: true },
            { path: path.join(workingFolder, 'file2'), mutated: false, included: false },
            { path: onlineFile, mutated: false, included: true }
          ],
          port: 46,
          strykerOptions: options,
          sandboxWorkingFolder: workingFolder
        };
        expect(ResilientTestRunnerFactory.create).to.have.been.calledWith(options.testRunner, expectedSettings);
      });

      describe('when run', () => {
        it('should run the testRunner', () => sut.run(231313).then(() => expect(testRunner.run).to.have.been.calledWith({ timeout: 231313 })));
      });

      describe('when runMutant()', () => {
        let mutant: any;
        let actualRunResult: RunResult;
        const testFilterCodeFragment = 'Some code fragment';

        beforeEach(() => {
          mutant = {
            filename: expectedFileToMutate.path,
            save: sinon.stub().returns(Promise.resolve()),
            scopedTestIds: [1, 2],
            timeSpentScopedTests: 12,
            reset: sinon.stub().returns(Promise.resolve()),
          };
          testFramework.filter.returns(testFilterCodeFragment);
        });

        describe('when mutant has scopedTestIds', () => {

          beforeEach(() => sut.runMutant(mutant)
            .then(result => actualRunResult = result));

          it('should save the mutant to disk', () => expect(mutant.save).to.have.been.calledWith(expectedTargetFileToMutate));

          it('should filter the scoped tests', () => expect(testFramework.filter).to.have.been.calledWith(mutant.scopedTestIds));

          it('should write the filter code fragment to hooks file', () => expect(StrykerTempFolder.writeFile)
            .to.have.been.calledWith(expectedTestFrameworkHooksFile, wrapInClosure(testFilterCodeFragment)));

          it('should have ran testRunner with correct timeout', () => expect(testRunner.run)
            .to.have.been.calledWith({ timeout: 12 * 23 + 1000 }));

          it('should have resetted the source file', () => expect(mutant.reset).to.have.been.calledWith(expectedTargetFileToMutate));

        });
      });
    });
  });

  describe('when constructed without a testFramework or CoverageInstrumenter', () => {
    beforeEach(() => sut = new Sandbox(options, 3, files, null, null));

    describe('and initialized', () => {

      beforeEach(() => sut.initialize());

      it('should have created the isolated test runner', () => {
        const expectedSettings: IsolatedRunnerOptions = {
          files: [
            { path: path.join(workingFolder, '___testHooksForStryker.js'), mutated: false, included: true },
            { path: path.join(workingFolder, 'file1'), mutated: true, included: true },
            { path: path.join(workingFolder, 'file2'), mutated: false, included: false },
            { path: onlineFile, mutated: false, included: true }
          ],
          port: 46,
          strykerOptions: options,
          sandboxWorkingFolder: workingFolder
        };
        expect(ResilientTestRunnerFactory.create).to.have.been.calledWith(options.testRunner, expectedSettings);
      });

      describe('when runMutant()', () => {

        beforeEach(() => {
          const mutant: any = {
            filename: expectedFileToMutate.path,
            save: sinon.stub().returns(Promise.resolve()),
            scopedTestIds: [1, 2],
            timeSpentScopedTests: 12,
            reset: sinon.stub().returns(Promise.resolve()),
          };
          return sut.runMutant(mutant);
        });

        it('should not filter any tests', () => expect(StrykerTempFolder.writeFile).to.have.been.calledWith(expectedTestFrameworkHooksFile, '').and.with.callCount(1));
      });
    });
  });
});