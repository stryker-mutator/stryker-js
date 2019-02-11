import { expect } from 'chai';
import * as os from 'os';
import { File, LogLevel } from 'stryker-api/core';
import { TestFramework } from 'stryker-api/test_framework';
import Sandbox from '../../src/Sandbox';
import { SandboxPool } from '../../src/SandboxPool';
import { Task } from '../../src/utils/Task';
import { Mock, file, mock, testFramework, transpiledMutant } from '../helpers/producers';
import LoggingClientContext from '../../src/logging/LoggingClientContext';
import * as sinon from 'sinon';
import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { coreTokens } from '../../src/di';
import { InitialTestRunResult } from '../../src/process/InitialTestExecutor';
import { RunStatus } from 'stryker-api/test_runner';

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

  beforeEach(() => {
    expectedTestFramework = testFramework();
    firstSandbox = mock(Sandbox);
    secondSandbox = mock(Sandbox);
    const genericSandboxForAllSubsequentCallsToNewSandbox = mock(Sandbox);
    firstSandbox.dispose.resolves();
    secondSandbox.dispose.resolves();
    genericSandboxForAllSubsequentCallsToNewSandbox.dispose.resolves();
    firstSandbox.runMutant.resolves(factory.runResult());
    genericSandboxForAllSubsequentCallsToNewSandbox.runMutant.resolves(factory.runResult());
    secondSandbox.runMutant.rejects();
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

  describe('run', () => {
    it('should use maxConcurrentTestRunners when set', async () => {
      testInjector.options.maxConcurrentTestRunners = 1;
      sut = createSut();
      await sut.run(transpiledMutant());
      expect(Sandbox.create).to.have.callCount(1);
      expect(Sandbox.create).calledWith(testInjector.options, 0, initialTranspiledFiles, expectedTestFramework, OVERHEAD_TIME_MS, LOGGING_CONTEXT);
    });

    it('should use cpuCount when maxConcurrentTestRunners is set too high', async () => {
      sinon.stub(os, 'cpus').returns([1, 2, 3]); // stub 3 cpus
      testInjector.options.maxConcurrentTestRunners = 100;
      sut = createSut();
      await sut.run(transpiledMutant());
      expect(Sandbox.create).to.have.callCount(3);
      expect(Sandbox.create).calledWith(testInjector.options, 0, initialTranspiledFiles, expectedTestFramework, OVERHEAD_TIME_MS, LOGGING_CONTEXT);
    });

    it('should use the cpuCount when maxConcurrentTestRunners is <= 0', async () => {
      sinon.stub(os, 'cpus').returns([1, 2, 3]); // stub 3 cpus
      testInjector.options.maxConcurrentTestRunners = 0;
      sut = createSut();
      await sut.run(transpiledMutant());
      expect(Sandbox.create).to.have.callCount(3);
      expect(Sandbox.create).calledWith(testInjector.options, 0, initialTranspiledFiles, expectedTestFramework, OVERHEAD_TIME_MS, LOGGING_CONTEXT);
    });

    it('should use the cpuCount - 1 when a transpiler is configured', async () => {
      testInjector.options.transpilers = ['a transpiler'];
      testInjector.options.maxConcurrentTestRunners = 2;
      sinon.stub(os, 'cpus').returns([1, 2]); // stub 2 cpus
      sut = createSut();
      await sut.run(transpiledMutant());
      expect(Sandbox.create).to.have.callCount(1);
    });

    it('should reject when a sandbox couldn\'t be created', async () => {
      createStub.reset();
      const expectedError = new Error('foo error');
      createStub.rejects(expectedError);
      sut = createSut();
      await expect(sut.run(transpiledMutant())).rejectedWith(expectedError);
    });
  });
  describe('disposeAll', () => {
    it('should have disposed all sandboxes', async () => {
      sut = createSut();
      await sut.run(transpiledMutant());
      await sut.disposeAll();
      expect(firstSandbox.dispose).called;
      expect(secondSandbox.dispose).called;
    });

    it('should not do anything if no sandboxes were created', async () => {
      sut = createSut();
      await sut.disposeAll();
      expect(firstSandbox.dispose).not.called;
      expect(secondSandbox.dispose).not.called;
    });

    it('should not resolve when there are still sandboxes being created (issue #713)', async () => {
      // Arrange
      sut = createSut();
      sinon.stub(os, 'cpus').returns([1, 2, 3]); // stub 3 cpus
      const task = new Task<Sandbox>();
      const secondSandbox = sinon.createStubInstance(Sandbox);
      createStub.onCall(2).returns(task.promise); // promise is not yet resolved

      // Act
      const runPromise = sut.run(transpiledMutant());
      const disposePromise = sut.disposeAll();
      await runPromise;
      task.resolve(secondSandbox as unknown as Sandbox);
      await disposePromise;
      expect(secondSandbox.dispose).called;
    });
  });
});
