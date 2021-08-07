import { expect } from 'chai';
import { toArray } from 'rxjs/operators';
import sinon from 'sinon';
import { factory, tick } from '@stryker-mutator/test-helpers';
import { Task, ExpirableTask } from '@stryker-mutator/util';
import { lastValueFrom, range, ReplaySubject } from 'rxjs';

import { Pool, Resource } from '../../../src/concurrent';

describe(Pool.name, () => {
  let worker1: sinon.SinonStubbedInstance<Required<Resource>>;
  let worker2: sinon.SinonStubbedInstance<Required<Resource>>;
  let genericWorkerForAllSubsequentCreates: sinon.SinonStubbedInstance<Required<Resource>>;
  let createWorkerStub: sinon.SinonStub;
  let concurrencyToken$: ReplaySubject<number>;
  let sut: Pool<Required<Resource>>;

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
    return new Pool<Required<Resource>>(createWorkerStub, concurrencyToken$);
  }

  function setConcurrency(n: number) {
    Array.from({ length: n }).forEach((_, i) => concurrencyToken$.next(i));
  }

  describe('schedule', () => {
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
      const actualWorkers: Array<Required<Resource>> = [];

      // Act
      const onGoingTask = lastValueFrom(sut.schedule(range(0, 3), async (worker) => actualWorkers.push(worker)));

      // Assert
      expect(actualWorkers).lengthOf(0);
      expect(createWorkerStub).callCount(2);
      initWorker1Task.resolve();
      initWorker2Task.resolve();
      initWorker3Task.resolve();
      await tick(2);
      await sut.dispose();
      expect(actualWorkers).lengthOf(3);
      await onGoingTask;
    });

    it('should eventually create all workers', async () => {
      arrangeWorkers();
      setConcurrency(8);
      sut = createSut();
      const result = await captureWorkers(sut, 8);
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
      await expect(captureWorkers(sut, 1)).rejectedWith(expectedError);
    });

    it('should share workers across subscribers (for sharing between dry runner and mutation test runner)', async () => {
      // Arrange
      setConcurrency(2);
      arrangeWorkers();
      sut = createSut();

      // Act
      const firstResult = await lastValueFrom(sut.schedule(range(0, 2), (worker) => worker).pipe(toArray()));
      const secondResult = await lastValueFrom(sut.schedule(range(0, 2), (worker) => worker).pipe(toArray()));

      // Assert
      await sut.dispose();
      expect(firstResult).lengthOf(2);
      expect(secondResult).lengthOf(2);
      expect(firstResult[0]).eq(secondResult[0]);
      expect(firstResult[1]).eq(secondResult[1]);
    });

    it('should re-emit the presented worker in the stream', async () => {
      // Arrange
      arrangeWorkers();
      setConcurrency(2);
      const actualScheduledWork: Array<[number, Required<Resource>]> = [];
      sut = createSut();
      const onGoingWork = lastValueFrom(
        sut
          .schedule(range(0, 3), async (worker, input) => {
            await tick();
            actualScheduledWork.push([input, worker]);
          })
          .pipe(toArray())
      );
      await tick(3);

      // Act
      await sut.dispose();

      // Assert
      expect(actualScheduledWork).lengthOf(3);
      expect(actualScheduledWork).deep.eq([
        [0, worker1],
        [1, worker2],
        [2, worker1],
      ]);
      await onGoingWork;
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
      const allWorkers = await captureWorkers(sut, 1);

      // Assert
      expect(createWorkerStub).calledOnce;
      expect(allWorkers[0]).eq(worker1);
    });

    it('should await for all concurrency tokens to be delivered', async () => {
      // Arrange
      arrangeWorkers();
      setConcurrency(2);
      const actualWorkers: Array<Required<Resource>> = [];
      sut = createSut();
      const onGoingScheduledWork = lastValueFrom(sut.schedule(range(0, 2), (worker) => actualWorkers.push(worker)));

      // Act
      const timeoutResult = await ExpirableTask.timeout(sut.init(), 20);
      concurrencyToken$.complete();

      // Assert
      expect(timeoutResult).eq(ExpirableTask.TimeoutExpired);
      expect(actualWorkers).lengthOf(2);
      await sut.init();
      await onGoingScheduledWork;
    });

    it('should reject when a worker rejects', async () => {
      // Arrange
      arrangeWorkers();
      setConcurrency(2);
      const expectedError = new Error('expected error');
      worker2.init.rejects(expectedError);
      sut = createSut();

      // Act & Assert
      await expect(sut.init()).rejectedWith(expectedError);
      concurrencyToken$.complete();
    });
  });

  describe('dispose', () => {
    it('should have disposed all testRunners', async () => {
      setConcurrency(8);
      arrangeWorkers();
      sut = createSut();
      await captureWorkers(sut, 9);
      await sut.dispose();
      expect(worker1.dispose).called;
      expect(worker2.dispose).called;
      expect(genericWorkerForAllSubsequentCreates.dispose).called;
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
      const resultPromise = lastValueFrom(sut.schedule(range(0, 2), (worker) => worker).pipe(toArray()));
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
      const actualTestRunnersPromise = lastValueFrom(sut.schedule(range(0, 3), (worker) => worker).pipe(toArray()));
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

  async function captureWorkers(suite: Pool<Required<Resource>>, inputCount: number) {
    // Eagerly get all test runners
    const createAllPromise = lastValueFrom(
      suite
        .schedule(range(0, inputCount), async (worker) => {
          await tick();
          return worker;
        })
        .pipe(toArray())
    );

    // But don't await yet, until after dispose.
    // Allow processes to be created
    await tick(inputCount);

    // Dispose completes the internal recycle bin subject, which in turn will complete.
    await suite.dispose();
    concurrencyToken$.complete();
    return createAllPromise;
  }
});
