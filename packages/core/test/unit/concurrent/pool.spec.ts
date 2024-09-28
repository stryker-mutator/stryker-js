import { expect } from 'chai';
import sinon from 'sinon';
import { factory, tick } from '@stryker-mutator/test-helpers';
import { Task, ExpirableTask } from '@stryker-mutator/util';
import { toArray, mergeWith, lastValueFrom, range, ReplaySubject } from 'rxjs';

import { Pool, Resource } from '../../../src/concurrent/index.js';

describe(Pool.name, () => {
  let worker1: sinon.SinonStubbedInstance<Required<Resource>>;
  let worker2: sinon.SinonStubbedInstance<Required<Resource>>;
  let genericWorkerForAllSubsequentCreates: sinon.SinonStubbedInstance<Required<Resource>>;
  let createWorkerStub: sinon.SinonStub;
  let concurrencyTokenSubject: ReplaySubject<number>;
  let sut: Pool<Required<Resource>>;

  beforeEach(() => {
    concurrencyTokenSubject = new ReplaySubject();
    worker1 = factory.testRunner(1);
    worker2 = factory.testRunner(2);
    genericWorkerForAllSubsequentCreates = factory.testRunner();
    createWorkerStub = sinon.stub();
  });

  afterEach(async () => {
    concurrencyTokenSubject.complete();
    await sut.dispose();
  });

  function arrangeWorkers() {
    createWorkerStub.returns(genericWorkerForAllSubsequentCreates).onCall(0).returns(worker1).onCall(1).returns(worker2);
  }

  function createSut() {
    return new Pool<Required<Resource>>(createWorkerStub, concurrencyTokenSubject);
  }

  function setConcurrency(n: number) {
    range(0, n).subscribe(concurrencyTokenSubject.next.bind(concurrencyTokenSubject));
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
      const onGoingTask = lastValueFrom(sut.schedule(range(0, 3), (worker) => actualWorkers.push(worker)));

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
      const result = await captureWorkers(8);
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
      await expect(captureWorkers(1)).rejectedWith(expectedError);
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
          .pipe(toArray()),
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

    it('should allow for parallel schedules, without interference (#3473)', async () => {
      // Arrange
      arrangeWorkers();
      setConcurrency(2);
      sut = createSut();
      let nrOfParallelTasks = 0;
      let maxNrOfParallelTasks = 0;
      const countParallelTasks = async () => {
        nrOfParallelTasks++;
        maxNrOfParallelTasks = Math.max(nrOfParallelTasks, maxNrOfParallelTasks);
        await tick();
        nrOfParallelTasks--;
      };

      // Act
      await lastValueFrom(sut.schedule(range(0, 3), countParallelTasks).pipe(mergeWith(sut.schedule(range(3, 3), countParallelTasks))));
      await sut.dispose();

      // Assert
      expect(maxNrOfParallelTasks).eq(2);
    });

    it('should reject when an error occurs', async () => {
      // Arrange
      arrangeWorkers();
      setConcurrency(2);
      sut = createSut();

      // Act
      const expectedError = new Error('Expected error');
      await expect(
        lastValueFrom(
          sut.schedule(range(0, 3), (_, n) => {
            if (n === 1) {
              throw expectedError;
            }
          }),
        ),
      ).rejectedWith(expectedError);
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
      concurrencyTokenSubject.complete();
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
      concurrencyTokenSubject.complete();

      // Act
      await sut.init();
      await sut.init();
      const allWorkers = await captureWorkers(1);

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
      concurrencyTokenSubject.complete();

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
      concurrencyTokenSubject.complete();
    });
  });

  describe('dispose', () => {
    it('should have disposed all workers', async () => {
      setConcurrency(8);
      arrangeWorkers();
      sut = createSut();
      await captureWorkers(9);
      await sut.dispose();
      expect(worker1.dispose).called;
      expect(worker2.dispose).called;
      expect(genericWorkerForAllSubsequentCreates.dispose).called;
    });

    it('should dispose workers only once', async () => {
      // Arrange
      setConcurrency(2);
      arrangeWorkers();
      concurrencyTokenSubject.complete();
      sut = createSut();
      await sut.init();

      // Act
      await sut.dispose();
      await sut.dispose();

      // Assert
      expect(worker1.dispose).calledOnce;
      expect(worker2.dispose).calledOnce;
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
      concurrencyTokenSubject.complete();

      // Assert
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
      const actualWorkers = lastValueFrom(sut.schedule(range(0, 3), (worker) => worker).pipe(toArray()));
      const disposePromise = sut.dispose();
      task.resolve();
      task2.resolve();
      await disposePromise;
      concurrencyTokenSubject.complete();
      await actualWorkers;

      // Assert
      expect(createWorkerStub).calledTwice;
    });
  });

  async function captureWorkers(inputCount: number) {
    // Eagerly get all test runners
    const createAllPromise = lastValueFrom(
      sut
        .schedule(range(0, inputCount), async (worker) => {
          await tick();
          return worker;
        })
        .pipe(toArray()),
    );

    // But don't await yet, until after dispose.
    // Allow processes to be created
    await tick(inputCount + 1);

    // Dispose completes the internal recycle bin subject, which in turn will complete.
    await sut.dispose();
    concurrencyTokenSubject.complete();
    return createAllPromise;
  }
});
