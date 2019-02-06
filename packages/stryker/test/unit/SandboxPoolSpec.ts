import { expect } from 'chai';
import * as os from 'os';
import { flatMap, toArray } from 'rxjs/operators';
import { File, LogLevel } from 'stryker-api/core';
import { TestFramework } from 'stryker-api/test_framework';
import Sandbox from '../../src/Sandbox';
import {SandboxPool} from '../../src/SandboxPool';
import { Task } from '../../src/utils/Task';
import { Mock, file, mock, testFramework } from '../helpers/producers';
import LoggingClientContext from '../../src/logging/LoggingClientContext';
import { sleep } from '../helpers/testUtils';
import * as sinon from 'sinon';
import { testInjector } from '@stryker-mutator/test-helpers';
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
  let expectedInputFiles: File[];
  let createStub: sinon.SinonStub;

  beforeEach(() => {
    expectedTestFramework = testFramework();
    firstSandbox = mock(Sandbox as any);
    firstSandbox.dispose.resolves();
    secondSandbox = mock(Sandbox as any);
    secondSandbox.dispose.resolves();
    const genericSandboxForAllSubsequentCallsToNewSandbox = mock<Sandbox>(Sandbox as any);
    genericSandboxForAllSubsequentCallsToNewSandbox.dispose.resolves();
    createStub = sinon.stub(Sandbox, 'create')
      .resolves(genericSandboxForAllSubsequentCallsToNewSandbox)
      .onCall(0).resolves(firstSandbox)
      .onCall(1).resolves(secondSandbox);

    expectedInputFiles = [file()];
    sut = createSut();
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
      .injectClass(SandboxPool);
  }

  describe('streamSandboxes', () => {
    it('should use maxConcurrentTestRunners when set', async () => {
      testInjector.options.maxConcurrentTestRunners = 1;
      await sut.streamSandboxes(expectedInputFiles).pipe(toArray()).toPromise();
      expect(Sandbox.create).to.have.callCount(1);
      expect(Sandbox.create).calledWith(testInjector.options, 0, expectedInputFiles, expectedTestFramework, OVERHEAD_TIME_MS, LOGGING_CONTEXT);
    });

    it('should use cpuCount when maxConcurrentTestRunners is set too high', async () => {
      sinon.stub(os, 'cpus').returns([1, 2, 3]); // stub 3 cpus
      testInjector.options.maxConcurrentTestRunners = 100;
      const actual = await sut.streamSandboxes(expectedInputFiles).pipe(toArray()).toPromise();
      expect(actual).lengthOf(3);
      expect(Sandbox.create).to.have.callCount(3);
      expect(Sandbox.create).calledWith(testInjector.options, 0, expectedInputFiles, expectedTestFramework, OVERHEAD_TIME_MS, LOGGING_CONTEXT);
    });

    it('should use the cpuCount when maxConcurrentTestRunners is <= 0', async () => {
      sinon.stub(os, 'cpus').returns([1, 2, 3]); // stub 3 cpus
      testInjector.options.maxConcurrentTestRunners = 0;
      const actual = await sut.streamSandboxes(expectedInputFiles).pipe(toArray()).toPromise();
      expect(Sandbox.create).to.have.callCount(3);
      expect(actual).lengthOf(3);
      expect(Sandbox.create).calledWith(testInjector.options, 0, expectedInputFiles, expectedTestFramework, OVERHEAD_TIME_MS, LOGGING_CONTEXT);
    });

    it('should use the cpuCount - 1 when a transpiler is configured', async () => {
      testInjector.options.transpilers = ['a transpiler'];
      testInjector.options.maxConcurrentTestRunners = 2;
      sinon.stub(os, 'cpus').returns([1, 2]); // stub 2 cpus
      const actual = await sut.streamSandboxes(expectedInputFiles).pipe(toArray()).toPromise();
      expect(Sandbox.create).to.have.callCount(1);
      expect(actual).lengthOf(1);
    });
  });
  describe('dispose', () => {
    it('should have disposed all sandboxes', async () => {
      await sut.streamSandboxes(expectedInputFiles).pipe(toArray()).toPromise();
      await sut.disposeAll();
      expect(firstSandbox.dispose).called;
      expect(secondSandbox.dispose).called;
    });

    it('should not do anything if no sandboxes were created', async () => {
      await sut.disposeAll();
      expect(firstSandbox.dispose).not.called;
      expect(secondSandbox.dispose).not.called;
    });

    it('should not resolve when there are still sandboxes being created (issue #713)', async () => {
      // Arrange
      sinon.stub(os, 'cpus').returns([1, 2, 3]); // stub 3 cpus
      const task = new Task<Sandbox>();
      createStub.onCall(2).returns(task.promise); // promise is not yet resolved
      const registeredSandboxes: Sandbox[] = [];
      let disposeAllResolved = false;
      await sut.streamSandboxes(expectedInputFiles).pipe(flatMap(async sandbox => {
        if (registeredSandboxes.push(sandbox) === 2) {
          // Act: The last sandbox will take a while to resolve (it is not yet created)
          const disposeAllPromise = sut.disposeAll().then(_ => disposeAllResolved = true);
          await tick();

          // Assert: dispose should not have resolved yet, because last sandbox is not created yet
          expect(disposeAllResolved).not.ok;
          task.resolve(mock(Sandbox as any) as any); // Make sure it finally is resolved
          await disposeAllPromise;
        }
      }), toArray()).toPromise();
    });
  });
});

function tick() {
  return sleep(0);
}
