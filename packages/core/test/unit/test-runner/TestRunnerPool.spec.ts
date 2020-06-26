import os = require('os');

import { promisify } from 'util';

import { expect } from 'chai';
import { toArray } from 'rxjs/operators';
import sinon = require('sinon');
import { TestRunner2 } from '@stryker-mutator/api/test_runner2';
import { factory, testInjector } from '@stryker-mutator/test-helpers';

import { Task } from '@stryker-mutator/util';

import { TestRunnerPool } from '../../../src/test-runner';
import { coreTokens } from '../../../src/di';

describe(TestRunnerPool.name, () => {
  let testRunner1: sinon.SinonStubbedInstance<Required<TestRunner2>>;
  let testRunner2: sinon.SinonStubbedInstance<Required<TestRunner2>>;
  let genericTestRunnerForAllSubsequentCreates: sinon.SinonStubbedInstance<Required<TestRunner2>>;
  let createTestRunnerStub: sinon.SinonStub;

  beforeEach(() => {
    testRunner1 = factory.testRunner();
    testRunner2 = factory.testRunner();
    genericTestRunnerForAllSubsequentCreates = factory.testRunner();
    createTestRunnerStub = sinon.stub();
  });

  function arrangeTestRunners() {
    createTestRunnerStub.returns(genericTestRunnerForAllSubsequentCreates).onCall(0).returns(testRunner1).onCall(1).returns(testRunner2);
  }

  function createSut() {
    return testInjector.injector.provideValue(coreTokens.testRunnerFactory, createTestRunnerStub).injectClass(TestRunnerPool);
  }

  describe('testRunner$', () => {
    it('should use maxConcurrentTestRunners when set', async () => {
      arrangeTestRunners();
      testInjector.options.maxConcurrentTestRunners = 1;
      const sut = createSut();
      const actualCreatedTestRunners = await actSubscribeAllTestRunners(sut);
      expect(actualCreatedTestRunners).lengthOf(1);
      expect(actualCreatedTestRunners[0]).eq(testRunner1);
      expect(createTestRunnerStub).calledOnce;
    });

    it('should use the cpuCount when maxConcurrentTestRunners is <= 0', async () => {
      arrangeTestRunners();
      sinon.stub(os, 'cpus').returns([1]); // stub 1 cpus
      testInjector.options.maxConcurrentTestRunners = 0;
      const sut = createSut();
      const actualCreatedTestRunners = await actSubscribeAllTestRunners(sut);
      expect(actualCreatedTestRunners).lengthOf(1);
      expect(actualCreatedTestRunners[0]).eq(testRunner1);
      expect(createTestRunnerStub).calledOnce;
    });

    it("should create 2 test runners at a time (for performance reasons, we don't to overwhelm the device)", async () => {
      // Arrange
      arrangeTestRunners();
      sinon.stub(os, 'cpus').returns([1, 2, 3]); // stub 3 cpus
      const initTestRunner1Task = new Task<void>();
      const initTestRunner2Task = new Task<void>();
      const initTestRunner3Task = new Task<void>();
      testRunner1.init.returns(initTestRunner1Task.promise);
      testRunner2.init.returns(initTestRunner2Task.promise);
      genericTestRunnerForAllSubsequentCreates.init.returns(initTestRunner3Task.promise);
      const sut = createSut();
      const actualTestRunners: Array<Required<TestRunner2>> = [];

      // Act
      sut.testRunner$.subscribe((testRunner) => actualTestRunners.push(testRunner));

      // Assert
      expect(actualTestRunners).lengthOf(0);
      expect(createTestRunnerStub).callCount(2);
      initTestRunner1Task.resolve();
      initTestRunner2Task.resolve();
      initTestRunner3Task.resolve();
      await promisify(process.nextTick)(); // give test runners a change to initialize
      await promisify(process.nextTick)(); // give test runners a change to initialize
      await sut.dispose();
      expect(actualTestRunners).lengthOf(3);
    });

    it('should eventually create all test runners', async () => {
      arrangeTestRunners();
      sinon.stub(os, 'cpus').returns([0, 1, 2, 3, 4, 5, 6, 7]);
      const result = await actSubscribeAllTestRunners(createSut());
      expect(result).lengthOf(8);
      expect(result).deep.eq([
        testRunner1,
        testRunner2,
        genericTestRunnerForAllSubsequentCreates,
        genericTestRunnerForAllSubsequentCreates,
        genericTestRunnerForAllSubsequentCreates,
        genericTestRunnerForAllSubsequentCreates,
        genericTestRunnerForAllSubsequentCreates,
        genericTestRunnerForAllSubsequentCreates,
      ]);
    });

    it('should use the cpuCount - 1 when a transpiler is configured (and later with the checker api)', async () => {
      arrangeTestRunners();
      testInjector.options.transpilers = ['a transpiler'];
      testInjector.options.maxConcurrentTestRunners = 2;
      sinon.stub(os, 'cpus').returns([1, 2]); // stub 2 cpus
      const sut = createSut();
      await actSubscribeAllTestRunners(sut);
      expect(createTestRunnerStub).to.have.callCount(1);
    });

    it("should reject when a test runner couldn't be created", async () => {
      const expectedError = new Error('foo error');
      createTestRunnerStub.throws(expectedError);
      const sut = createSut();
      await expect(actSubscribeAllTestRunners(sut)).rejectedWith(expectedError);
    });

    it('should share test runners across subscribers (for sharing between dry runner and mutation test runner)', async () => {
      // Arrange
      testInjector.options.maxConcurrentTestRunners = 2;
      arrangeTestRunners();
      const sut = createSut();

      // Act
      const firstResultPromise = sut.testRunner$.pipe(toArray()).toPromise();
      const secondResult = await actSubscribeAllTestRunners(sut);

      // Assert
      expect(await firstResultPromise).lengthOf(2);
      expect(secondResult).lengthOf(2);
    });
  });

  describe('recycle', () => {
    it('should recycle the presented test runner in the stream', async () => {
      // Arrange
      arrangeTestRunners();
      testInjector.options.maxConcurrentTestRunners = 2;
      const actualTestRunners: Array<Required<TestRunner2>> = [];
      const sut = createSut();
      sut.testRunner$.subscribe((testRunner) => actualTestRunners.push(testRunner));
      await testRunnerCreation();

      // Act
      sut.recycle(testRunner1);
      await sut.dispose();

      // Assert
      expect(actualTestRunners).lengthOf(3);
      expect(actualTestRunners).deep.eq([testRunner1, testRunner2, testRunner1]);
    });
  });

  describe('dispose', () => {
    it('should have disposed all testRunners', async () => {
      arrangeTestRunners();
      const sut = createSut();
      await actSubscribeAllTestRunners(sut);
      await sut.dispose();
      expect(testRunner1.dispose).called;
      expect(testRunner2.dispose).called;
    });

    it('should not do anything if no sandboxes were created', async () => {
      const sut = createSut();
      await sut.dispose();
      expect(testRunner1.dispose).not.called;
      expect(testRunner2.dispose).not.called;
    });

    it('should not resolve when there are still test runners being initialized (issue #713)', async () => {
      // Arrange
      arrangeTestRunners();
      sinon.stub(os, 'cpus').returns([1, 2]); // stub 2 cpus
      const task = new Task<void>();
      const task2 = new Task<void>();
      testRunner1.init.returns(task.promise);
      testRunner2.init.returns(task2.promise);
      const sut = createSut();

      // Act
      const resultPromise = sut.testRunner$.pipe(toArray()).toPromise();
      task.resolve();
      await sut.dispose();
      task2.resolve();
      await resultPromise;
      expect(testRunner1.dispose).called;
      expect(testRunner2.dispose).called;
    });

    it('should halt creating of new sandboxes', async () => {
      // Arrange
      arrangeTestRunners();
      sinon.stub(os, 'cpus').returns([1, 2, 3]); // stub 3 cpus
      const task = new Task<void>();
      const task2 = new Task<void>();
      testRunner1.init.returns(task.promise);
      testRunner2.init.returns(task2.promise);
      const sut = createSut();

      // Act
      const actualTestRunnersPromise = sut.testRunner$.pipe(toArray()).toPromise();
      const disposePromise = sut.dispose();
      task.resolve();
      task2.resolve();
      await disposePromise;
      await actualTestRunnersPromise;

      // Assert
      expect(createTestRunnerStub).calledTwice;
    });
  });

  async function actSubscribeAllTestRunners(sut: TestRunnerPool) {
    // Eagerly get all test runners
    const createAllPromise = sut.testRunner$.pipe(toArray()).toPromise();

    // But don't await yet, until after dispose.
    // Allow processes to be created
    await testRunnerCreation();

    // Dispose completes the internal recycle bin subject, which in turn will complete.
    await sut.dispose();
    return createAllPromise;
  }
});
async function testRunnerCreation() {
  for await (const _ of os.cpus()) {
    await promisify(process.nextTick)();
  }
}
