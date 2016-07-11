import TestRunnerOrchestrator from '../../src/TestRunnerOrchestrator';
import * as sinon from 'sinon';
import StrykerTempFolder from '../../src/utils/StrykerTempFolder';
import {Reporter, MutantStatus, MutantResult} from 'stryker-api/report';
import {TestSelector} from 'stryker-api/test_selector';
import {TestRunner, RunResult, RunOptions, RunnerOptions, TestResult} from 'stryker-api/test_runner';
import {StrykerOptions} from 'stryker-api/core';
import IsolatedTestRunnerAdapter from '../../src/isolated-runner/IsolatedTestRunnerAdapter';
import IsolatedTestRunnerAdapterFactory from '../../src/isolated-runner/IsolatedTestRunnerAdapterFactory';
import * as chai from 'chai';
import * as _ from 'lodash';
import * as os from 'os';
import * as path from 'path';
let expect = chai.expect;

let mockMutant = (id: number) => {
  return {
    filename: `mutant${id}`,
    save: sinon.stub().returns(Promise.resolve()),
    scopedTestIds: [id],
    timeSpentScopedTests: id,
    reset: sinon.stub().returns(Promise.resolve()),
  };
}

describe('TestRunnerOrchestrator', () => {
  let sut: TestRunnerOrchestrator;
  let sandbox: sinon.SinonSandbox;
  let files = [
    { path: path.join(process.cwd(), 'a.js'), shouldMutate: true },
    { path: path.join(process.cwd(), 'b.js'), shouldMutate: true },
    { path: path.join(process.cwd(), 'aSpec.js'), shouldMutate: false },
    { path: path.join(process.cwd(), 'bSpec.js'), shouldMutate: false }
  ];
  let strykerOptions: StrykerOptions = { testRunner: 'superRunner', port: 42, timeoutFactor: 1, timeoutMs: 0 };
  let firstTestRunner: { run: sinon.SinonStub, dispose: sinon.SinonStub };
  let secondTestRunner: { run: sinon.SinonStub, dispose: sinon.SinonStub };
  let selector: TestSelector;
  let reporter: Reporter;

  beforeEach(() => {
    firstTestRunner = {
      run: sinon.stub(),
      dispose: sinon.stub()
    };
    secondTestRunner = {
      run: sinon.stub(),
      dispose: sinon.stub()
    };

    let configureTestRunner = (stub: sinon.SinonStub) => stub
      // Run mutants
      .withArgs({ timeout: 0 }).returns(Promise.resolve({ result: TestResult.Complete, succeeded: 1 }))
      .withArgs({ timeout: 1 }).returns(Promise.resolve({ result: TestResult.Complete, failed: 1 }))
      .withArgs({ timeout: 2 }).returns(Promise.resolve({ result: TestResult.Complete }))
      .withArgs({ timeout: 3 }).returns(Promise.resolve({ result: TestResult.Timeout }))
      .withArgs({ timeout: 4 }).returns(Promise.resolve({ result: TestResult.Error }))
      
      // Initial test run
      .withArgs({ timeout: 10000 })
        .onCall(0).returns(Promise.resolve({ result: TestResult.Complete, succeeded: 1 }))
        .onCall(1).returns(Promise.resolve({ result: TestResult.Complete, failed: 1 }))
        .onCall(2).returns(Promise.resolve({ result: TestResult.Complete }));
            

    configureTestRunner(firstTestRunner.run);
    configureTestRunner(secondTestRunner.run);
    selector = {
      select: sinon.stub().returns('some selected contents')
    };
    reporter = {
      onMutantTested: sinon.stub(),
      onAllMutantsTested: sinon.stub()
    };
    sandbox = sinon.sandbox.create();
    sandbox.stub(IsolatedTestRunnerAdapterFactory, 'create')
      .onFirstCall().returns(firstTestRunner)
      .onSecondCall().returns(secondTestRunner);
    sandbox.stub(StrykerTempFolder, 'createRandomFolder').returns('a-folder');
    sandbox.stub(StrykerTempFolder, 'ensureFolderExists').returns('a-folder');
    sandbox.stub(StrykerTempFolder, 'copyFile').returns(Promise.resolve());
    sandbox.stub(StrykerTempFolder, 'writeFile').returns(Promise.resolve());
  });

  describe('without test selector', () => {
    beforeEach(() => {
      sut = new TestRunnerOrchestrator(strykerOptions, files, null, reporter);
    });

    describe('initialRun()', () => {
      let results: RunResult[];
      beforeEach(() => sut.initialRun().then(res => results = res));

      it('should run all tests without selecting specific ones and report one runResult', () => {
        expect(results.length).to.be.eq(1);
      });
    });

    describe('runMutations() with 2 mutants', () => {
      let mutants: any;
      let mutantResults: MutantResult[];
      beforeEach(() => {
        sandbox.stub(os, 'cpus', () => [1]); // stub 1 cpu1
        mutants = [mockMutant(0), mockMutant(1)];
        return sut.runMutations(mutants)
          .then(results => mutantResults = results);
      });

      it('should not select test files', () => expect(StrykerTempFolder.writeFile).to.not.have.been.called);

      it('should report 2 results', () => expect(mutantResults.length).to.be.eq(2));
    });
  });

  describe('with test selector', () => {
    beforeEach(() => {
      sut = new TestRunnerOrchestrator(strykerOptions, files, selector, reporter);
    });

    describe('initialRun()', () => {
      let results: RunResult[];

      beforeEach(() => sut.initialRun().then(res => results = res));

      it('should have created an isolated test runner', () => {
        let expectedFiles = [{ path: path.join('a-folder', '___testSelection.js'), shouldMutate: false }];
        files.forEach(file => expectedFiles.push(file));
        expect(IsolatedTestRunnerAdapterFactory.create).to.have.been.calledWith({ files: expectedFiles, port: 42, coverageEnabled: true, strykerOptions });
      });

      describe('.then()', () => {

        it('should have selected 3 tests in total', () => {
          expect(selector.select).to.have.callCount(3);
          expect(selector.select).to.have.been.calledWith([0]);
          expect(selector.select).to.have.been.calledWith([1]);
          expect(selector.select).to.have.been.calledWith([2]);
          expect(StrykerTempFolder.writeFile).to.have.been.calledWith(path.join('a-folder', '___testSelection.js'), 'some selected contents').with.callCount(3);
        });

        it('should have reported the correct results', () => {
          expect(results).to.deep.equal([{ result: TestResult.Complete, succeeded: 1 }, { result: TestResult.Complete, failed: 1 }]);
        });

        it('should have disposed the test runner', () => {
          expect(firstTestRunner.dispose).to.have.been.calledWith();
        });
      });
    });

    describe('runMutations() with 2 cpus and 5 mutants', () => {
      let donePromise: Promise<void>;
      let mutants: any[];
      let mutantResults: MutantResult[];

      beforeEach(() => {
        sandbox.stub(os, 'cpus', () => [1, 2]); // stub 2 cpus

        var untestedMutant = mockMutant(0);
        untestedMutant.scopedTestIds = [];

        mutants = [untestedMutant, mockMutant(1), mockMutant(2), mockMutant(3), mockMutant(4)];
        return sut.runMutations(mutants)
          .then(results => mutantResults = results);
      });

      it('should have created 2 test runners', () => {
        let expectedFiles = [
          { path: `a-folder${path.sep}___testSelection.js`, shouldMutate: false },
          { path: `a-folder${path.sep}a.js`, shouldMutate: true },
          { path: `a-folder${path.sep}b.js`, shouldMutate: true },
          { path: `a-folder${path.sep}aSpec.js`, shouldMutate: false },
          { path: `a-folder${path.sep}bSpec.js`, shouldMutate: false }
        ];

        expect(IsolatedTestRunnerAdapterFactory.create).to.have.been.calledWithMatch
          ({ files: expectedFiles, port: 42, coverageEnabled: false, strykerOptions });
        expect(IsolatedTestRunnerAdapterFactory.create).to.have.been.calledWith
          ({ files: expectedFiles, port: 43, coverageEnabled: false, strykerOptions });
      });

      it('should have ran mutant 1 and 3 on the first test runner', () => {
        expect(firstTestRunner.run).to.have.been.calledTwice;
      });

      it('should have ran mutant 2 and mutant 4 on the second test runner', () => {
        expect(secondTestRunner.run).to.have.been.calledTwice;
      });

      it('should have reported onMutantTested on all mutants', () => {
        expect(reporter.onMutantTested).to.have.callCount(5)
        expect(reporter.onMutantTested).to.have.been.calledWith(mutantResults[0]);
        expect(reporter.onMutantTested).to.have.been.calledWith(mutantResults[1]);
        expect(reporter.onMutantTested).to.have.been.calledWith(mutantResults[2]);
        expect(reporter.onMutantTested).to.have.been.calledWith(mutantResults[3]);
        expect(reporter.onMutantTested).to.have.been.calledWith(mutantResults[4]);
      });

      it('should have reported onAllMutantsTested', () => {
        expect(reporter.onAllMutantsTested).to.have.been.calledWith(mutantResults);
      });

      it('should eventually resolve the correct mutant results', () => {
        expect(mutantResults.length).to.be.eq(5);

        let sortedMutantResults = _.sortBy(mutantResults, r => r.sourceFilePath);

        expect(sortedMutantResults[0].status).to.be.eq(MutantStatus.UNTESTED);
        expect(sortedMutantResults[1].status).to.be.eq(MutantStatus.KILLED);
        expect(sortedMutantResults[2].status).to.be.eq(MutantStatus.SURVIVED);
        expect(sortedMutantResults[3].status).to.be.eq(MutantStatus.TIMEDOUT);
        expect(sortedMutantResults[4].status).to.be.eq(MutantStatus.KILLED);
      });
    });

  });


  afterEach(() => {
    sandbox.restore();
  });
});