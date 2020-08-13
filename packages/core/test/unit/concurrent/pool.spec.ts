import os from 'os';

import { expect } from 'chai';
import { toArray } from 'rxjs/operators';
import sinon from 'sinon';
import { factory, tick } from '@stryker-mutator/test-helpers';
import { Task, ExpirableTask } from '@stryker-mutator/util';
import { ReplaySubject } from 'rxjs';

import { Pool, Worker } from '../../../src/concurrent';

describe(Pool.name, () => {
  let worker1: sinon.SinonStubbedInstance<Required<Worker>>;
  let worker2: sinon.SinonStubbedInstance<Required<Worker>>;
  let genericWorkerForAllSubsequentCreates: sinon.SinonStubbedInstance<Required<Worker>>;
  let createWorkerStub: sinon.SinonStub;
  let concurrencyToken$: ReplaySubject<number>;
  let sut: Pool<Required<Worker>>;

  beforeEach(() => {
    concurrencyToken$ = new ReplaySubject();
    worker1 = factory.testRunner();
    worker2 = factory.testRunner();
    genericWorkerForAllSubsequentCreates = factory.testRunner();
    createWorkerStub = sinon.stub();
  });

  afterEach(() => {
    concurrencyToken$.complete();
    sut.dispose();
  });

  function arrangeWorkers() {
    createWorkerStub.returns(genericWorkerForAllSubsequentCreates).onCall(0).returns(worker1).onCall(1).returns(worker2);
  }

  function createSut() {
    return new Pool<Required<Worker>>(createWorkerStub, concurrencyToken$);
  }

  function setConcurrency(n: number) {
    Array.from({ length: n }).forEach((_, i) => concurrencyToken$.next(i));
  }

  describe('worker$', () => {
    it("should create 2 workers at a time (for performance reasons, we don't to overwhelm the device)", async () => {
      // Arrange
      arrangeWorkers();
      setConcurrency(3);
      const initWorker1Task = new Task<void>();
      const initWorker2Task = new Task<void>();
      const initWorker3Task = new Task<void>();
      worker1.init.returns(initWorker1Task.promise);
      worker2.init.returns(initWorker2Task.promise);
      genericWorkerForAllSubsequentCreates.init.returns(initWorker3Task.promise);
      sut = createSut();
      const actualWorkers: Array<Required<Worker>> = [];

      // Act
      sut.worker$.subscribe((worker) => actualWorkers.push(worker));

      // Assert
      expect(actualWorkers).lengthOf(0);
      expect(createWorkerStub).callCount(2);
      initWorker1Task.resolve();
      initWorker2Task.resolve();
      initWorker3Task.resolve();
      await tick(2);
      await sut.dispose();
      expect(actualWorkers).lengthOf(3);
    });

    it('should eventually create all workers', async () => {
      arrangeWorkers();
      setConcurrency(8);
      const result = await actSubscribeAllWorkers(createSut());
      expect(result).lengthOf(8);
      expect(result).deep.eq([
        worker1,
        worker2,
        genericWorkerForAllSubsequentCreates,
        genericWorkerForAllSubsequentCreates,
        genericWorkerForAllSubsequentCreates,
        genericWorkerForAllSubsequentCreates,
        genericWorkerForAllSubsequentCreates,
        genericWorkerForAllSubsequentCreates,
      ]);
    });

    it("should reject when a worker couldn't be created", async () => {
      setConcurrency(1);
      const expectedError = new Error('foo error');
      createWorkerStub.throws(expectedError);
      sut = createSut();
      await expect(actSubscribeAllWorkers(sut)).rejectedWith(expectedError);
    });

    it('should share workers across subscribers (for sharing between dry runner and mutation test runner)', async () => {
      // Arrange
      setConcurrency(2);
      arrangeWorkers();
      sut = createSut();

      // Act
      const firstResultPromise = sut.worker$.pipe(toArray()).toPromise();
      const secondResult = await actSubscribeAllWorkers(sut);

      // Assert
      expect(await firstResultPromise).lengthOf(2);
      expect(secondResult).lengthOf(2);
    });
  });

  describe('init', () => {
    it('should await the init() of all workers', async () => {
      // Arrange
      arrangeWorkers();
      setConcurrency(2);
      const initWorker2Task = new Task<void>();
      worker2.init.returns(initWorker2Task.promise);
      worker1.init.resolves();
      sut = createSut();

      // Act
      const timeoutResult = await ExpirableTask.timeout(sut.init(), 20);
      initWorker2Task.resolve();
      concurrencyToken$.complete();
      await sut.init();
      await sut.dispose();

      // Assert
      expect(timeoutResult).eq(ExpirableTask.TimeoutExpired);
      expect(worker1.init).called;
      expect(worker2.init).called;
    });

    it('should cache the workers for later use', async () => {
      // Arrange
      arrangeWorkers();
      setConcurrency(1);
      sut = createSut();
      concurrencyToken$.complete();

      // Act
      await sut.init();
      await sut.init();
      const allWorkers = sut.worker$.pipe(toArray()).toPromise();
      await tick();
      sut.dispose();

      // Assert
      expect(createWorkerStub).calledOnce;
      expect(await allWorkers).deep.eq([worker1]);
    });

    it('should await for all concurrency tokens to be delivered', async () => {
      // Arrange
      arrangeWorkers();
      setConcurrency(2);
      const actualWorkers: Array<Required<Worker>> = [];
      sut = createSut();
      sut.worker$.subscribe((worker) => actualWorkers.push(worker));

      // Act
      const timeoutResult = await ExpirableTask.timeout(sut.init(), 20);
      concurrencyToken$.complete();
      await sut.init();
      await sut.dispose();

      // Assert
      expect(timeoutResult).eq(ExpirableTask.TimeoutExpired);
      expect(actualWorkers).lengthOf(2);
    });

    it('should reject when a worker rejects', async () => {
      // Arrange
      arrangeWorkers();
      setConcurrency(2);
      const expectedError = new Error('expected error');
      worker2.init.rejects(expectedError);
      sut = createSut();
      const actualWorkers = sut.worker$.toPromise();

      // Act & Assert
      await expect(sut.init()).rejectedWith(expectedError);
      await expect(actualWorkers).rejectedWith(expectedError);
      concurrencyToken$.complete();
      await sut.dispose();
    });
  });

  describe('recycle', () => {
    it('should re-emit the presented worker in the stream', async () => {
      // Arrange
      arrangeWorkers();
      setConcurrency(2);
      const actualWorkers: Array<Required<Worker>> = [];
      sut = createSut();
      sut.worker$.subscribe((worker) => actualWorkers.push(worker));
      await tick(2);

      // Act
      sut.recycle(worker1);
      await sut.dispose();

      // Assert
      expect(actualWorkers).lengthOf(3);
      expect(actualWorkers).deep.eq([worker1, worker2, worker1]);
    });
  });

  describe('dispose', () => {
    it('should have disposed all testRunners', async () => {
      setConcurrency(8);
      arrangeWorkers();
      sut = createSut();
      await actSubscribeAllWorkers(sut);
      await sut.dispose();
      expect(worker1.dispose).called;
      expect(worker2.dispose).called;
    });

    it('should not do anything if no workers were created', async () => {
      sut = createSut();
      await sut.dispose();
      expect(worker1.dispose).not.called;
      expect(worker2.dispose).not.called;
    });

    it('should not resolve when there are still workers being initialized (issue #713)', async () => {
      // Arrange
      arrangeWorkers();
      setConcurrency(2);
      const task = new Task<void>();
      const task2 = new Task<void>();
      worker1.init.returns(task.promise);
      worker2.init.returns(task2.promise);
      sut = createSut();

      // Act
      const resultPromise = sut.worker$.pipe(toArray()).toPromise();
      task.resolve();
      await sut.dispose();
      task2.resolve();
      concurrencyToken$.complete();
      await resultPromise;
      expect(worker1.dispose).called;
      expect(worker2.dispose).called;
    });

    it('should halt creating of new sandboxes', async () => {
      // Arrange
      arrangeWorkers();
      setConcurrency(3);
      const task = new Task<void>();
      const task2 = new Task<void>();
      worker1.init.returns(task.promise);
      worker2.init.returns(task2.promise);
      sut = createSut();

      // Act
      const actualTestRunnersPromise = sut.worker$.pipe(toArray()).toPromise();
      const disposePromise = sut.dispose();
      task.resolve();
      task2.resolve();
      await disposePromise;
      concurrencyToken$.complete();
      await actualTestRunnersPromise;

      // Assert
      expect(createWorkerStub).calledTwice;
    });
  });

  async function actSubscribeAllWorkers(sut: Pool<Required<Worker>>) {
    // Eagerly get all test runners
    const createAllPromise = sut.worker$.pipe(toArray()).toPromise();

    // But don't await yet, until after dispose.
    // Allow processes to be created
    await tick(os.cpus().length);

    // Dispose completes the internal recycle bin subject, which in turn will complete.
    await sut.dispose();
    concurrencyToken$.complete();
    return createAllPromise;
  }
});
