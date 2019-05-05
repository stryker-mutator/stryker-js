import { File, LogLevel } from '@stryker-mutator/api/core';
import { MutantResult } from '@stryker-mutator/api/report';
import { TestFramework } from '@stryker-mutator/api/test_framework';
import { RunStatus } from '@stryker-mutator/api/test_runner';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { file, testFramework } from '@stryker-mutator/test-helpers/src/factory';
import { expect } from 'chai';
import * as os from 'os';
import { from } from 'rxjs';
import { toArray } from 'rxjs/operators';
import * as sinon from 'sinon';
import { coreTokens } from '../../src/di';
import LoggingClientContext from '../../src/logging/LoggingClientContext';
import { InitialTestRunResult } from '../../src/process/InitialTestExecutor';
import Sandbox from '../../src/Sandbox';
import { SandboxPool } from '../../src/SandboxPool';
import TranspiledMutant from '../../src/TranspiledMutant';
import { Task } from '../../src/utils/Task';
import { Mock, mock, transpiledMutant } from '../helpers/producers';

const OVERHEAD_TIME_MS = 42;
const LOGGING_CONTEXT: LoggingClientContext = Object.freeze({
  level: LogLevel.Fatal,
  port: 4200
});

describe(SandboxPool.name, () => {
  let sut: SandboxPool;
  let firstSandbox: Mock<Sandbox>;
  let secondSandbox: Mock<Sandbox>;
  let expectedTestFramework: TestFramework;
  let initialTranspiledFiles: File[];
  let createStub: sinon.SinonStub;
  let inputMutants: TranspiledMutant[];
  let genericSandboxForAllSubsequentCallsToNewSandbox: Mock<Sandbox>;

  beforeEach(() => {
    expectedTestFramework = testFramework();
    firstSandbox = mock(Sandbox);
    secondSandbox = mock(Sandbox);
    genericSandboxForAllSubsequentCallsToNewSandbox = mock(Sandbox);
    firstSandbox.dispose.resolves();
    secondSandbox.dispose.resolves();
    genericSandboxForAllSubsequentCallsToNewSandbox.dispose.resolves();
    firstSandbox.runMutant.resolves(factory.runResult());
    genericSandboxForAllSubsequentCallsToNewSandbox.runMutant.resolves(factory.runResult());
    secondSandbox.runMutant.resolves(factory.runResult());
    inputMutants = [transpiledMutant()];
    createStub = sinon.stub(Sandbox, 'create')
      .resolves(genericSandboxForAllSubsequentCallsToNewSandbox)
      .onCall(0).resolves(firstSandbox)
      .onCall(1).resolves(secondSandbox);

    initialTranspiledFiles = [file()];
  });

  function createSut(): SandboxPool {
    const initialRunResult: InitialTestRunResult = {
      coverageMaps: {},
      overheadTimeMS: OVERHEAD_TIME_MS,
      runResult: { tests: [], status: RunStatus.Complete },
      sourceMapper: {
        transpiledFileNameFor: n => n,
        transpiledLocationFor: n => n
      }
    };

    return testInjector.injector
      .provideValue(coreTokens.testFramework, expectedTestFramework as unknown as TestFramework)
      .provideValue(coreTokens.initialRunResult, initialRunResult)
      .provideValue(coreTokens.loggingContext, LOGGING_CONTEXT)
      .provideValue(coreTokens.transpiledFiles, initialTranspiledFiles)
      .injectClass(SandboxPool);
  }
  function actRunMutants() {
    return sut.runMutants(from(inputMutants))
      .pipe(toArray())
      .toPromise();
  }

  describe('runMutants', () => {

    it('should use maxConcurrentTestRunners when set', async () => {
      testInjector.options.maxConcurrentTestRunners = 1;
      sut = createSut();
      await actRunMutants();
      expect(Sandbox.create).to.have.callCount(1);
      expect(Sandbox.create).calledWith(testInjector.options, 0, initialTranspiledFiles, expectedTestFramework, OVERHEAD_TIME_MS, LOGGING_CONTEXT);
    });

    it('should use cpuCount when maxConcurrentTestRunners is set too high', async () => {
      sinon.stub(os, 'cpus').returns([1, 2, 3]); // stub 3 cpus
      testInjector.options.maxConcurrentTestRunners = 100;
      inputMutants.push(transpiledMutant('file 2.js'));
      inputMutants.push(transpiledMutant('file 3.js'));

      sut = createSut();
      await actRunMutants();
      expect(Sandbox.create).to.have.callCount(3);
      expect(Sandbox.create).calledWith(testInjector.options, 0, initialTranspiledFiles, expectedTestFramework, OVERHEAD_TIME_MS, LOGGING_CONTEXT);
    });

    it('should use the cpuCount when maxConcurrentTestRunners is <= 0', async () => {
      sinon.stub(os, 'cpus').returns([1]); // stub 1 cpus
      testInjector.options.maxConcurrentTestRunners = 0;
      sut = createSut();
      await actRunMutants();
      expect(Sandbox.create).to.have.callCount(1);
      expect(Sandbox.create).calledWith(testInjector.options, 0, initialTranspiledFiles, expectedTestFramework, OVERHEAD_TIME_MS, LOGGING_CONTEXT);
    });

    it('should create 2 sandboxes at a time', async () => {
      // Arrange
      sinon.stub(os, 'cpus').returns([1, 2, 3]); // stub 3 cpus
      inputMutants.push(transpiledMutant('file 2.js'));
      inputMutants.push(transpiledMutant('file 3.js')); // 3 mutants
      const sut = createSut();
      const allResults: MutantResult[] = [];
      const runTask = new Task<undefined>();
      const createFirstSandboxTask = new Task<Sandbox>();
      const createSecondSandboxTask = new Task<Sandbox>();
      const createThirdSandboxTask = new Task<Sandbox>();
      const secondResultTask = new Task<undefined>();
      const firstRunMutantTask = new Task<MutantResult>();
      const secondMutantTask = new Task<MutantResult>();
      createStub.reset();
      createStub
        .onFirstCall().returns(createFirstSandboxTask.promise)
        .onSecondCall().returns(createSecondSandboxTask.promise)
        .onThirdCall().returns(createThirdSandboxTask.promise);
      firstSandbox.runMutant.reset();
      firstSandbox.runMutant.returns(firstRunMutantTask.promise);
      secondSandbox.runMutant.reset();
      secondSandbox.runMutant.returns(secondMutantTask.promise);
      sut.runMutants(from(inputMutants)).subscribe({
        complete: () => {
          runTask.resolve(undefined);
        },
        next: result => {
          allResults.push(result);
          if (allResults.length === 2) {
            secondResultTask.resolve(undefined);
          }
        }
      });
      expect(allResults).lengthOf(0);
      expect(createStub).callCount(2);

      // Act
      createFirstSandboxTask.resolve(firstSandbox as unknown as Sandbox);
      createThirdSandboxTask.resolve(genericSandboxForAllSubsequentCallsToNewSandbox as unknown as Sandbox);
      await secondResultTask.promise;
      expect(createStub).callCount(3);
      firstRunMutantTask.resolve(factory.mutantResult());

      // Assert
      await runTask.promise;
      expect(allResults).lengthOf(3);
      expect(createStub).callCount(3);
      expect(firstSandbox.runMutant).callCount(1);
      expect(genericSandboxForAllSubsequentCallsToNewSandbox.runMutant).callCount(2);
    });

    it('should use the cpuCount - 1 when a transpiler is configured', async () => {
      testInjector.options.transpilers = ['a transpiler'];
      testInjector.options.maxConcurrentTestRunners = 2;
      sinon.stub(os, 'cpus').returns([1, 2]); // stub 2 cpus
      sut = createSut();
      await actRunMutants();
      expect(Sandbox.create).to.have.callCount(1);
    });

    it('should reject when a sandbox couldn\'t be created', async () => {
      createStub.reset();
      const expectedError = new Error('foo error');
      createStub.rejects(expectedError);
      sut = createSut();
      await expect(actRunMutants()).rejectedWith(expectedError);
    });
  });

  describe('dispose', () => {
    it('should have disposed all sandboxes', async () => {
      sut = createSut();
      await actRunMutants();
      await sut.dispose();
      expect(firstSandbox.dispose).called;
      expect(secondSandbox.dispose).called;
    });

    it('should not do anything if no sandboxes were created', async () => {
      sut = createSut();
      await sut.dispose();
      expect(firstSandbox.dispose).not.called;
      expect(secondSandbox.dispose).not.called;
    });

    it('should not resolve when there are still sandboxes being created (issue #713)', async () => {
      // Arrange
      sut = createSut();
      sinon.stub(os, 'cpus').returns([1, 2]); // stub 2 cpus
      const task = new Task<Sandbox>();
      const task2 = new Task<Sandbox>();
      createStub.reset();
      createStub
        .onCall(0).returns(task.promise)
        .onCall(1).returns(task2.promise)
        .onCall(2).resolves(genericSandboxForAllSubsequentCallsToNewSandbox); // promise is not yet resolved
      inputMutants.push(transpiledMutant());

      // Act
      const runPromise = sut.runMutants(from(inputMutants)).toPromise();
      task.resolve(firstSandbox as unknown as Sandbox);
      await runPromise;
      const disposePromise = sut.dispose();
      task2.resolve(secondSandbox as unknown as Sandbox);
      await disposePromise;
      expect(secondSandbox.dispose).called;
    });

    it('should halt creating of new sandboxes', async () => {
      // Arrange
      sut = createSut();
      sinon.stub(os, 'cpus').returns([1, 2, 3]); // stub 3 cpus
      const task = new Task<Sandbox>();
      const task2 = new Task<Sandbox>();
      createStub.reset();
      createStub
        .onCall(0).returns(task.promise)
        .onCall(1).returns(task2.promise)
        .onCall(2).resolves(genericSandboxForAllSubsequentCallsToNewSandbox); // promise is not yet resolved
      inputMutants.push(transpiledMutant(), transpiledMutant()); // 3 mutants

      // Act
      const runPromise = sut.runMutants(from(inputMutants))
        .pipe(toArray())
        .toPromise();
      const disposePromise = sut.dispose();
      task.resolve(firstSandbox as unknown as Sandbox);
      task2.resolve(secondSandbox as unknown as Sandbox);
      await disposePromise;
      await runPromise;

      // Assert
      expect(createStub).calledTwice;
    });
  });
});
