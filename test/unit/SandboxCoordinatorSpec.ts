import * as sinon from 'sinon';
import * as _ from 'lodash';
import * as os from 'os';
import { expect } from 'chai';
import { MutantStatus, MutantResult } from 'stryker-api/report';
import { RunResult, RunStatus, TestStatus } from 'stryker-api/test_runner';
import { StrykerOptions } from 'stryker-api/core';
import SandboxCoordinator from '../../src/SandboxCoordinator';
import * as sandbox from '../../src/Sandbox';


const mockMutant = (id: number) => {
  const dummyString = `mutant${id}`;
  return {
    filename: dummyString,
    mutatorName: dummyString,
    replacement: dummyString,
    location: dummyString,
    range: dummyString,
    originalLines: dummyString,
    mutatedLines: dummyString,
    scopedTestIds: [0, 1]
  };
};

describe('SandboxCoordinator', () => {
  let sut: SandboxCoordinator;
  let sinonSandbox: sinon.SinonSandbox;
  let firstSandbox: { initialize: sinon.SinonStub, run: sinon.SinonStub, runMutant: sinon.SinonStub, dispose: sinon.SinonStub };
  let secondSandbox: { initialize: sinon.SinonStub, run: sinon.SinonStub, runMutant: sinon.SinonStub, dispose: sinon.SinonStub };
  let options: StrykerOptions;
  let reporter: any;
  let coverageInstrumenter: any;
  const expectedTestFramework: any = 'expected test framework';
  const expectedRunResult = { isTheExpectedRunResult: true };
  const expectedInputFiles: any = { isInputFiles: true };

  beforeEach(() => {
    options = {};
    coverageInstrumenter = 'a coverage instrumenter';
    sinonSandbox = sinon.sandbox.create();
    const createSandbox = () => ({
      initialize: sinonSandbox.stub().returns(Promise.resolve()),
      run: sinonSandbox.stub().returns(expectedRunResult),
      runMutant: sinonSandbox.stub(),
      dispose: sinonSandbox.stub().returns(Promise.resolve())
    });
    firstSandbox = createSandbox();
    secondSandbox = createSandbox();
    reporter = {
      onMutantTested: sinonSandbox.stub(),
      onAllMutantsTested: sinonSandbox.stub()
    };
    sinonSandbox.stub(sandbox, 'default')
      .onCall(0).returns(firstSandbox)
      .onCall(1).returns(secondSandbox);
    sut = new SandboxCoordinator(options, expectedInputFiles, expectedTestFramework, reporter);
  });

  describe('on initialRun', () => {
    let actualRunResult: RunResult;
    beforeEach(() => sut.initialRun(coverageInstrumenter).then(runResult => actualRunResult = runResult));

    it('should create a sandbox with correct arguments',
      () => expect(sandbox.default).to.have.been.calledWith(options, 0, expectedInputFiles, expectedTestFramework, coverageInstrumenter));

    it('should initialize the sandbox', () => expect(firstSandbox.initialize).to.have.been.called);

    it('should have ran with 5 minute timeout', () => expect(firstSandbox.run).to.have.been.calledWith(60 * 1000 * 5));

    it('should have disposed the sandbox', () => expect(firstSandbox.dispose).to.have.been.called);

    it('should resolve in expected result', () => expect(actualRunResult).to.be.eq(expectedRunResult));
  });

  describe('on runMutants() with 2 cpus and 5 mutants', () => {
    let actualMutantResults: MutantResult[];

    beforeEach(() => {
      sinonSandbox.stub(os, 'cpus', () => [1, 2]); // stub 2 cpus
      const uncoveredMutant = mockMutant(0);
      uncoveredMutant.scopedTestIds = [];
      const mutants: any[] = [uncoveredMutant, mockMutant(1), mockMutant(2), mockMutant(3), mockMutant(4)];

      // The uncovered mutant should not be run in a sandbox
      // Mock first sandbox to return first success, then failed
      firstSandbox.runMutant
        .withArgs(mutants[1]).returns(Promise.resolve({ status: RunStatus.Complete, tests: [{ name: 'test1', status: TestStatus.Success }, { name: 'skipped', status: TestStatus.Skipped }] }))
        .withArgs(mutants[3]).returns(Promise.resolve({ status: RunStatus.Complete, tests: [{ name: 'test2', status: TestStatus.Failed }] }));

      // Mock second sandbox to return first timeout, then error
      secondSandbox.runMutant
        .withArgs(mutants[2]).returns(Promise.resolve({ status: RunStatus.Timeout, tests: [{ name: 'test3', status: TestStatus.Skipped }] }))
        .withArgs(mutants[4]).returns(Promise.resolve({ status: RunStatus.Error, tests: [{ name: 'test4', status: TestStatus.Skipped }] }));

      return sut.runMutants(mutants)
        .then(results => actualMutantResults = results);
    });

    it('should have created 2 sandboxes', () => {
      expect(sandbox.default).to.have.been.calledWithNew;
      expect(sandbox.default).to.have.been.calledTwice;
      expect(sandbox.default).to.have.been.calledWith(options, 0, expectedInputFiles, expectedTestFramework, null);
      expect(sandbox.default).to.have.been.calledWith(options, 1, expectedInputFiles, expectedTestFramework, null);
    });

    it('should have ran 2 mutants on the first sandbox', () => expect(firstSandbox.runMutant).to.have.been.calledTwice);

    it('should have ran 2 mutants on the second sandbox', () => expect(secondSandbox.runMutant).to.have.been.calledTwice);

    it('should have reported onMutantTested on all mutants', () => {
      expect(reporter.onMutantTested).to.have.callCount(5);
      expect(reporter.onMutantTested).to.have.been.calledWith(actualMutantResults[0]);
      expect(reporter.onMutantTested).to.have.been.calledWith(actualMutantResults[1]);
      expect(reporter.onMutantTested).to.have.been.calledWith(actualMutantResults[2]);
      expect(reporter.onMutantTested).to.have.been.calledWith(actualMutantResults[3]);
      expect(reporter.onMutantTested).to.have.been.calledWith(actualMutantResults[4]);
    });

    it('should have reported onAllMutantsTested', () => expect(reporter.onAllMutantsTested).to.have.been.calledWith(actualMutantResults));

    it('should eventually resolve the correct mutant results', () => {
      expect(actualMutantResults.length).to.be.eq(5);

      let sortedMutantResults = _.sortBy(actualMutantResults, r => r.mutatorName);

      expect(sortedMutantResults[0].status).to.be.eq(MutantStatus.NoCoverage);
      expect(sortedMutantResults[1].status).to.be.eq(MutantStatus.Survived);
      expect(sortedMutantResults[2].status).to.be.eq(MutantStatus.TimedOut);
      expect(sortedMutantResults[3].status).to.be.eq(MutantStatus.Killed);
      expect(sortedMutantResults[4].status).to.be.eq(MutantStatus.Error);
    });

    it('should have disposed all sandboxes', () => {
      expect(firstSandbox.dispose).to.have.been.called;
      expect(secondSandbox.dispose).to.have.been.called;
    });
  });

  afterEach(() => sinonSandbox.restore());
});