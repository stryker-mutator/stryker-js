import { TestRunner } from '@stryker-mutator/api/test-runner';
import { notEmpty, Task } from '@stryker-mutator/util';
import { filter, ignoreElements, lastValueFrom, mergeMap, Observable, ReplaySubject, Subject, Subscription, tap, zip } from 'rxjs';
import { Disposable, tokens } from 'typed-inject';

import { CheckerFacade } from '../checker/index.js';
import { coreTokens } from '../di/index.js';

const MAX_CONCURRENT_INIT = 2;

/**
 * Represents a TestRunner that is also a Resource (with an init and dispose)
 */
export type TestRunnerResource = Resource & TestRunner;

export interface Resource extends Partial<Disposable> {
  init?(): Promise<void>;
}

createTestRunnerPool.inject = tokens(coreTokens.testRunnerFactory, coreTokens.testRunnerConcurrencyTokens);
export function createTestRunnerPool(factory: () => TestRunnerResource, concurrencyToken$: Observable<number>): Pool<TestRunner> {
  return new Pool(factory, concurrencyToken$);
}

createCheckerPool.inject = tokens(coreTokens.checkerFactory, coreTokens.checkerConcurrencyTokens);
export function createCheckerPool(factory: () => CheckerFacade, concurrencyToken$: Observable<number>): Pool<CheckerFacade> {
  return new Pool<CheckerFacade>(factory, concurrencyToken$);
}

/**
 * Represents a work item: an input with a task and with a `result$` observable where the result (exactly one) will be streamed to.
 */
class WorkItem<TResource extends Resource, TIn, TOut> {
  private readonly resultSubject = new Subject<TOut>();
  public readonly result$ = this.resultSubject.asObservable();

  /**
   * @param input The input to the ask
   * @param task The task, where a resource and input is presented
   */
  constructor(private readonly input: TIn, private readonly task: (resource: TResource, input: TIn) => Promise<TOut> | TOut) {}

  public async execute(resource: TResource) {
    try {
      const output = await this.task(resource, this.input);
      this.resultSubject.next(output);
      this.resultSubject.complete();
    } catch (err) {
      this.resultSubject.error(err);
    }
  }

  public reject(error: unknown) {
    this.resultSubject.error(error);
  }

  public complete() {
    this.resultSubject.complete();
  }
}

/**
 * Represents a pool of resources. Use `schedule` to schedule work to be executed on the resources.
 * The pool will automatically recycle the resources, but will make sure only one task is executed
 * on one resource at any one time. Creates as many resources as the concurrency tokens allow.
 * Also takes care of the initialing of the resources (with `init()`)
 */
export class Pool<TResource extends Resource> implements Disposable {
  // The init subject. Using an RxJS subject instead of a promise, so errors are silently ignored when nobody is listening
  private readonly initSubject = new Subject();
  private readonly createdResources: TResource[] = [];
  // The queued work items. This is a replay subject, so scheduled work items can easily be rejected after it was picked up
  private readonly todoSubject = new ReplaySubject<WorkItem<TResource, any, any>>();

  private readonly subscription: Subscription;
  private readonly workItem$: Observable<unknown>;

  constructor(factory: () => TResource, concurrencyToken$: Observable<number>) {
    const resource$ = new Subject<TResource>();
    this.workItem$ = zip(resource$, this.todoSubject).pipe(
      mergeMap(async ([resource, workItem]) => {
        await workItem.execute(resource);
        resource$.next(resource);
      }),
      ignoreElements()
    );
    this.subscription = this.workItem$.subscribe({
      error: (error) => {
        this.todoSubject.subscribe((workItem) => workItem.reject(error));
      },
    });
    concurrencyToken$
      .pipe(
        mergeMap(async () => {
          if (this.isDisposed) {
            return null;
          } else {
            const resource = factory();
            this.createdResources.push(resource);
            await resource.init?.();
            return resource;
          }
        }, MAX_CONCURRENT_INIT),
        filter(notEmpty),
        tap({
          complete: () => {
            this.initSubject.complete();
          },
          error: (err) => {
            this.initSubject.error(err);
          },
        })
      )
      .subscribe({
        next: (resource) => resource$.next(resource),
        error: (err) => resource$.error(err),
      });
  }

  /**
   * Returns a promise that resolves if all concurrency tokens have resulted in initialized resources.
   * This is optional, resources will get initialized either way.
   */
  public async init(): Promise<void> {
    await lastValueFrom(this.initSubject);
  }

  /**
   * Schedules a task to be executed on resources in the pool. Each input is paired with a resource, which allows async work to be done.
   * @param input$ The inputs to pair up with a resource.
   * @param task The task to execute on each resource
   */
  public schedule<TIn, TOut>(input$: Observable<TIn>, task: (resource: TResource, input: TIn) => Promise<TOut> | TOut): Observable<TOut> {
    return input$.pipe(
      mergeMap((input) => {
        const workItem = new WorkItem(input, task);
        this.todoSubject.next(workItem);
        return workItem.result$;
      })
    );
  }

  private isDisposed = false;

  /**
   * Dispose the pool
   */
  public async dispose(): Promise<void> {
    if (!this.isDisposed) {
      this.isDisposed = true;
      this.subscription.unsubscribe();
      this.todoSubject.subscribe((workItem) => workItem.complete());
      this.todoSubject.complete();
      await Promise.all(this.createdResources.map((resource) => resource.dispose?.()));
    }
  }
}
