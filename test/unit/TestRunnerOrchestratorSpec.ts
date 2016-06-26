import TestRunnerOrchestrator from '../../src/TestRunnerOrchestrator';
import * as sinon from 'sinon';
import StrykerTempFolder from '../../src/utils/StrykerTempFolder';
import {Reporter} from 'stryker-api/report';
import {TestSelector, TestSelectorFactory} from 'stryker-api/test_selector';
import {TestRunner, RunResult, RunOptions, RunnerOptions, TestResult} from 'stryker-api/test_runner';
import {MutantStatus, MutantResult} from 'stryker-api/report';
import IsolatedTestRunnerAdapter from '../../src/isolated-runner/IsolatedTestRunnerAdapter';
import IsolatedTestRunnerAdapterFactory from '../../src/isolated-runner/IsolatedTestRunnerAdapterFactory';
import * as chai from 'chai';
import * as _ from 'lodash';
import * as os from 'os';
import * as path from 'path';
let expect = chai.expect;


describe('TestRunnerOrchestrator', () => {
  let sut: TestRunnerOrchestrator;
  let sandbox: sinon.SinonSandbox;
  let files = [
    { path: path.join(process.cwd(), 'a.js'), shouldMutate: true },
    { path: path.join(process.cwd(), 'b.js'), shouldMutate: true },
    { path: path.join(process.cwd(), 'aSpec.js'), shouldMutate: false },
    { path: path.join(process.cwd(), 'bSpec.js'), shouldMutate: false }
  ];
  let strykerOptions = { testFramework: 'superFramework', testRunner: 'superRunner', port: 42 };
  let firstTestRunner: any;
  let secondTestRunner: any;
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
    firstTestRunner.run
      .onFirstCall().returns(Promise.resolve({ result: TestResult.Complete, succeeded: 1 }))
      .onSecondCall().returns(Promise.resolve({ result: TestResult.Complete, failed: 1 }))
      .onThirdCall().returns(Promise.resolve({ result: TestResult.Complete }));
    secondTestRunner.run.returns(Promise.resolve({ result: TestResult.Timeout }));
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
    sandbox.stub(TestSelectorFactory.instance(), 'create', () => selector);
    sandbox.stub(StrykerTempFolder, 'createRandomFolder').returns('a-folder');
    sandbox.stub(StrykerTempFolder, 'ensureFolderExists').returns('a-folder');
    sandbox.stub(StrykerTempFolder, 'copyFile').returns(Promise.resolve());
    sandbox.stub(StrykerTempFolder, 'writeFile').returns(Promise.resolve());
    sut = new TestRunnerOrchestrator(strykerOptions, files, reporter);
  });

  describe('recordCoverage()', () => {
    let results: RunResult[];

    beforeEach(() => sut.recordCoverage().then(res => results = res));

    it('should have created an isolated test runner', () => {
      let expectedFiles = [{ path: path.join('a-folder', '___testSelection.js'), shouldMutate: false }];
      files.forEach(file => expectedFiles.push(file));
      expect(IsolatedTestRunnerAdapterFactory.create).to.have.been.calledWith({ files: expectedFiles, port: 42, coverageEnabled: true, strykerOptions });
    });

    it('should have created the test selector', () => {
      expect(TestSelectorFactory.instance().create).to.have.been.calledWith(strykerOptions.testFramework, { options: strykerOptions });
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

  describe('runMutations() with 2 cpus and 4 mutants', () => {
    let donePromise: Promise<void>;
    let mutants: any[];
    let mutantResults: MutantResult[];

    let mockMutant = (id: number) => {
      return {
        filename: `mutant${id}`,
        save: sinon.stub().returns(Promise.resolve()),
        scopedTestIds: [id],
        timeSpentScopedTests: id,
        reset: sinon.stub().returns(Promise.resolve()),
      };
    }

    beforeEach(() => {
      sandbox.stub(os, 'cpus', () => [1, 2]); // stub 2 cpus

      var untestedMutant = mockMutant(0);
      untestedMutant.scopedTestIds = [];

      mutants = [untestedMutant, mockMutant(1), mockMutant(2), mockMutant(3)];
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

    it('should have ran mutant 2 on the second test runner', () => {
      expect(secondTestRunner.run).to.have.been.calledOnce;
    });

    it('should have reported onMutantTested on all mutants', () => {
      expect(reporter.onMutantTested).to.have.callCount(4)
      expect(reporter.onMutantTested).to.have.been.calledWith(mutantResults[0]);
      expect(reporter.onMutantTested).to.have.been.calledWith(mutantResults[1]);
      expect(reporter.onMutantTested).to.have.been.calledWith(mutantResults[2]);
      expect(reporter.onMutantTested).to.have.been.calledWith(mutantResults[3]);
    });

    it('should have reported onAllMutantsTested', () => {
      expect(reporter.onAllMutantsTested).to.have.been.calledWith(mutantResults);
    });

    it('should eventually resolve the correct mutant results', () => {
      expect(mutantResults.length).to.be.eq(4);

      let sortedMutantResults = _.sortBy(mutantResults, r => r.sourceFilePath);

      expect(sortedMutantResults[0].status).to.be.eq(MutantStatus.UNTESTED);
      expect(sortedMutantResults[1].status).to.be.eq(MutantStatus.KILLED);
      expect(sortedMutantResults[2].status).to.be.eq(MutantStatus.SURVIVED);
      expect(sortedMutantResults[3].status).to.be.eq(MutantStatus.TIMEDOUT);
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
});