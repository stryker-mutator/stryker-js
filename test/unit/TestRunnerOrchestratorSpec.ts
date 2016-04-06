import TestRunnerOrchestrator from '../../src/TestRunnerOrchestrator';
import * as sinon from 'sinon';
import {StrykerTempFolder} from '../../src/api/util';
import {TestSelector, TestSelectorFactory} from '../../src/api/test_selector';
import {TestRunner, RunResult, RunOptions, RunnerOptions, TestResult} from '../../src/api/test_runner';
import {MutantStatus} from '../../src/Mutant';
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
  let files = [{ path: 'a.js', shouldMutate: true }, { path: 'b.js', shouldMutate: true }, { path: 'aSpec.js', shouldMutate: false }, { path: 'bSpec.js', shouldMutate: false }];
  let strykerOptions = { testFramework: 'superFramework', testRunner: 'superRunner', port: 42 };
  let firstTestRunner: any;
  let secondTestRunner: any;
  let selector: TestSelector;

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
      files: sinon.stub().returns(['some', 'files']),
      select: sinon.stub().returns(Promise.resolve())
    };
    sandbox = sinon.sandbox.create();
    sandbox.stub(IsolatedTestRunnerAdapterFactory, 'create')
      .onFirstCall().returns(firstTestRunner)
      .onSecondCall().returns(secondTestRunner);
    sandbox.stub(TestSelectorFactory.instance(), 'create', () => selector);
    sut = new TestRunnerOrchestrator(strykerOptions, files);
  });

  describe('recordCoverage()', () => {
    let results: Promise<RunResult[]>;

    beforeEach(() => {
      results = sut.recordCoverage();
    });

    it('should have created an isolated test runner', () => {
      let expectedFiles = [{ path: 'some', shouldMutate: false }, { path: 'files', shouldMutate: false }];
      files.forEach(file => expectedFiles.push(file));
      expect(IsolatedTestRunnerAdapterFactory.create).to.have.been.calledWith({ files: expectedFiles, port: 42, coverageEnabled: true, strykerOptions });
    });

    it('should have created the test selector', () => {
      expect(TestSelectorFactory.instance().create).to.have.been.calledWith(strykerOptions.testFramework, { options: strykerOptions });
    });

    describe('.then()', () => {
      let runResults: RunResult[];
      beforeEach((done) => {
        results.then((r) => {
          runResults = r;
          done();
        });
      });

      it('should have reported the correct results', () => {
        expect(runResults).to.deep.equal([{ result: TestResult.Complete, succeeded: 1 }, { result: TestResult.Complete, failed: 1 }]);
      });

      it('should have disposed the test runner', () => {
        expect(firstTestRunner.dispose).to.have.been.calledWith();
      });
    });
  });

  describe('runMutations()', () => {
    let donePromise: Promise<void>;
    let mutants: any[];
    let reporter: any;

    let mockMutant = (id: number) => {
      return { filename: `mutant${id}`, save: sinon.stub().returns(Promise.resolve()), scopedTestIds: [id], timeSpentScopedTests: id, reset: sinon.stub().returns(Promise.resolve()), status: MutantStatus.UNTESTED };
    }

    beforeEach(() => {
      sandbox.stub(os, 'cpus', () => [1, 2]); // stub 2 cpus
      sandbox.stub(StrykerTempFolder, 'createRandomFolder').returns('a-folder');
      sandbox.stub(StrykerTempFolder, 'copyFile').returns(Promise.resolve());
      reporter = {
        mutantTested: sinon.stub()
      };
      
      var untestedMutant = mockMutant(0);
      untestedMutant.scopedTestIds = [];
      
      mutants = [mockMutant(1), mockMutant(2), mockMutant(3), untestedMutant];
      return sut.runMutations(mutants, reporter);
    });

    it('should have created 2 test runners', () => {
      let expectedFiles = [
        { path: 'some', shouldMutate: false },
        { path: 'files', shouldMutate: false },
        { path: `a-folder${path.sep}a.js`, shouldMutate: true },
        { path: `a-folder${path.sep}b.js`, shouldMutate: true },
        { path: 'aSpec.js', shouldMutate: false },
        { path: 'bSpec.js', shouldMutate: false }
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

    it('should have reported the mutant state of tested mutants correctly', () => {
      expect(mutants[0].status).to.be.eq(MutantStatus.KILLED);
      expect(mutants[1].status).to.be.eq(MutantStatus.SURVIVED);
      expect(mutants[2].status).to.be.eq(MutantStatus.TIMEDOUT);
    });
    
    it('should have reported the mutant state of an untested mutant correctly', () => {
      expect(mutants[3].status).to.be.eq(MutantStatus.UNTESTED);
    });
  });


  afterEach(() => {
    sandbox.restore();
  });
});