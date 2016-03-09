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
    directCompleteTestRunner = {
      run: sinon.stub().returns(Promise.resolve({ result: TestResult.Complete })),
      destroy: sinon.stub(),
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

  describe('record coverage', () => {
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
  });


  afterEach(() => {
    sandbox.restore();
  });
});