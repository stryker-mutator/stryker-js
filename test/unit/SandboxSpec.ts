import { expect } from 'chai';
import * as sinon from 'sinon';
import * as path from 'path';
import * as os from 'os';
import { StrykerOptions, InputFile } from 'stryker-api/core';
import { RunnerOptions, RunResult } from 'stryker-api/test_runner';
import Sandbox from '../../src/Sandbox';
import StrykerTempFolder from '../../src/utils/StrykerTempFolder';
import IsolatedTestRunnerAdapterFactory from '../../src/isolated-runner/IsolatedTestRunnerAdapterFactory';

describe('Sandbox', () => {
  let sut: Sandbox;
  let options: StrykerOptions;
  let sandbox: sinon.SinonSandbox;
  let files: InputFile[];
  let testRunner: any;
  let testFramework: any;
  let expectedFileToMutate: InputFile = { path: path.resolve('file1'), mutated: true, included: true };
  const workingFolder = 'random-folder-3';

  beforeEach(() => {
    options = { port: 43, timeoutFactor: 23, timeoutMs: 1000 };
    sandbox = sinon.sandbox.create();
    testRunner = { init: sandbox.stub(), run: sandbox.stub().returns(Promise.resolve()) };
    testFramework = {
      filter: sandbox.stub()
    };
    files = [
      expectedFileToMutate,
      { path: path.resolve('file2'), mutated: false, included: false }
    ];
    sandbox.stub(StrykerTempFolder, 'createRandomFolder').returns(workingFolder);
    sandbox.stub(StrykerTempFolder, 'ensureFolderExists').returnsArg(0);
    sandbox.stub(StrykerTempFolder, 'copyFile').returns(Promise.resolve({}));
    sandbox.stub(StrykerTempFolder, 'writeFile').returns(Promise.resolve({}));
    sandbox.stub(IsolatedTestRunnerAdapterFactory, 'create').returns(testRunner);
  });

  afterEach(() => sandbox.restore());

  describe('when constructed with a testFramework', () => {

    beforeEach(() => sut = new Sandbox(options, 3, files, testFramework));

    it('should have created a workingFolder', () => expect(StrykerTempFolder.createRandomFolder).to.have.been.calledWith('sandbox'));

    describe('when initialized()', () => {
      const expectedTargetFileToMutate = path.join(workingFolder, 'file1');
      const expectedTestFrameworkHooksFile = path.join(workingFolder, '___testFrameworkHooksForStryker.js');

      beforeEach(() => sut.initialize());

      it('should have copied the input files', () => expect(StrykerTempFolder.copyFile).to.have.been.calledWith(files[0].path, expectedTargetFileToMutate)
        .and.calledWith(files[1].path, path.join(workingFolder, 'file2')));

      it('should have created the isolated test runner inc framework hook', () => {
        const expectedSettings: RunnerOptions = {
          files: [
            { path: expectedTestFrameworkHooksFile, mutated: false, included: true },
            { path: expectedTargetFileToMutate, mutated: true, included: true },
            { path: path.join(workingFolder, 'file2'), mutated: false, included: false }
          ],
          port: 46,
          strykerOptions: options
        };
        expect(IsolatedTestRunnerAdapterFactory.create).to.have.been.calledWith(expectedSettings);
      });

      describe('when run', () => {
        it('should run the testRunner', () => sut.run(231313).then(() => expect(testRunner.run).to.have.been.calledWith({ timeout: 231313 })));
      });

      describe('when runMutant()', () => {
        let mutant: any;
        let actualRunResult: RunResult;
        const expectedTestFilterCodeFragment = 'Some code fragment';

        beforeEach(() => {
          mutant = {
            filename: expectedFileToMutate.path,
            save: sinon.stub().returns(Promise.resolve()),
            scopedTestIds: [1, 2],
            timeSpentScopedTests: 12,
            reset: sinon.stub().returns(Promise.resolve()),
          };
          testFramework.filter.returns(expectedTestFilterCodeFragment);
        });

        describe('when mutant has scopedTestIds', () => {

          beforeEach(() => sut.runMutant(mutant)
            .then(result => actualRunResult = result));

          it('should save the mutant to disk', () => expect(mutant.save).to.have.been.calledWith(expectedTargetFileToMutate));

          it('should filter the scoped tests', () => expect(testFramework.filter).to.have.been.calledWith(mutant.scopedTestIds));

          it('should write the filter code fragment to hooks file', () => expect(StrykerTempFolder.writeFile)
            .to.have.been.calledWith(expectedTestFrameworkHooksFile, expectedTestFilterCodeFragment));

          it('should have ran testRunner with correct timeout', () => expect(testRunner.run)
            .to.have.been.calledWith({ timeout: 12 * 23 + 1000 }));

          it('should have resetted the source file', () => expect(mutant.reset).to.have.been.calledWith(expectedTargetFileToMutate));

        });
      });
    });


  });

  describe('when constructed without a testFramework', () => {
    beforeEach(() => sut = new Sandbox(options, 3, files, undefined));

    describe('and initialized', () => {

      beforeEach(() => sut.initialize());

      it('should have created the isolated test runner without framework hooks file', () => {
        const expectedSettings: RunnerOptions = {
          files: [
            { path: path.join(workingFolder, 'file1'), mutated: true, included: true },
            { path: path.join(workingFolder, 'file2'), mutated: false, included: false }
          ],
          port: 46,
          strykerOptions: options
        };
        expect(IsolatedTestRunnerAdapterFactory.create).to.have.been.calledWith(expectedSettings);
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

        it('should not filter any tests', () => expect(StrykerTempFolder.writeFile).to.not.have.been.called);
      });
    });
  });
});