import TestRunnerOrchestrator from '../../src/TestRunnerOrchestrator';
import * as sinon from 'sinon';
import {TestSelector, TestSelectorFactory} from '../../src/api/test_selector';
import {TestRunner, TestRunnerFactory, RunResult, RunOptions, RunnerOptions, TestResult} from '../../src/api/test_runner';
import IsolatedTestRunnerAdapter from '../../src/isolated-runner/IsolatedTestRunnerAdapter';
import IsolatedTestRunnerAdapterFactory from '../../src/isolated-runner/IsolatedTestRunnerAdapterFactory';
import * as chai from 'chai';
import * as _ from 'lodash';
let expect = chai.expect;


describe('TestRunnerOrchestrator', () => {
  let sut: TestRunnerOrchestrator;
  let sandbox: Sinon.SinonSandbox;
  let sourceFiles = ['a.js', 'b.js'];
  let otherFiles = ['aSpec.js', 'bSpec.js'];
  let strykerOptions = { testFrameork: 'superFramework', testRunner: 'superRunner', port: 42 };
  let directCompleteTestRunner: any;
  let selector: TestSelector;


  beforeEach(() => {
    let runCallback = sinon.stub();
    runCallback
      .onFirstCall().returns(Promise.resolve({ result: TestResult.Complete, succeeded: 1 }))
      .onSecondCall().returns(Promise.resolve({ result: TestResult.Complete, failed: 1 }))
      .onThirdCall().returns(Promise.resolve({ result: TestResult.Complete }));
    directCompleteTestRunner = {
      run: runCallback,
      destroy: sinon.stub(),
      dispose: sinon.stub()
    };
    selector = {
      files: sinon.stub().returns(['some', 'files']),
      select: sinon.stub().returns(Promise.resolve())
    };
    sandbox = sinon.sandbox.create();
    sandbox.stub(IsolatedTestRunnerAdapterFactory, 'create', () => directCompleteTestRunner);
    sandbox.stub(TestSelectorFactory.instance(), 'create', () => selector);
    sut = new TestRunnerOrchestrator(strykerOptions, sourceFiles, otherFiles);
  });

  describe('recordCoverage()', () => {
    let results: Promise<RunResult[]>;

    beforeEach(() => {
      results = sut.recordCoverage();
    });

    it('should have created an isolated test runner', () => {
      let expectedOtherFiles = ['some', 'files'];
      otherFiles.forEach(file => expectedOtherFiles.push(file));
      expect(IsolatedTestRunnerAdapterFactory.create).to.have.been.calledWith({ sourceFiles, additionalFiles: expectedOtherFiles, port: 42, coverageEnabled: true, strykerOptions });
    });

    it('should have created the test selector', () => {
      expect(TestSelectorFactory.instance().create).to.have.been.calledWith(strykerOptions.testFrameork, { options: strykerOptions });
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
        expect(directCompleteTestRunner.dispose).to.have.been.calledWith();
      });
    });
  });


  afterEach(() => {
    sandbox.restore();
  });
});