import { TestRunner } from '@stryker-mutator/api/test-runner';
import { notEmpty } from '@stryker-mutator/util';
import {
  BehaviorSubject,
  filter,
  ignoreElements,
  lastValueFrom,
  mergeMap,
  Observable,
  ReplaySubject,
  Subject,
  takeUntil,
  tap,
  zip,
} from 'rxjs';
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

createTestRunnerPool.inject = tokens(
  coreTokens.testRunnerFactory,
  coreTokens.testRunnerConcurrencyTokens,
);
export function createTestRunnerPool(
  factory: () => TestRunnerResource,
  concurrencyToken$: Observable<number>,
): Pool<TestRunner> {
  return new Pool(factory, concurrencyToken$);
}

createCheckerPool.inject = tokens(
  coreTokens.checkerFactory,
  coreTokens.checkerConcurrencyTokens,
);
export function createCheckerPool(
  factory: () => CheckerFacade,
  concurrencyToken$: Observable<number>,
): Pool<CheckerFacade> {
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
  constructor(
    private readonly input: TIn,
    private readonly task: (
      resource: TResource,
      input: TIn,
    ) => Promise<TOut> | TOut,
  ) {}

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
  private readonly initSubject = new ReplaySubject<void>();

  // The disposedSubject emits true when it is disposed, and false when not disposed yet
  private readonly disposedSubject = new BehaviorSubject(false);

  // The dispose$ only emits one `true` value when disposed (never emits `false`). Useful for `takeUntil`
  private readonly dispose$ = this.disposedSubject.pipe(
    filter((isDisposed) => isDisposed),
  );

  private readonly createdResources: TResource[] = [];
  // The queued work items. This is a replay subject, so scheduled work items can easily be rejected after it was picked up
  private readonly todoSubject = new ReplaySubject<
    WorkItem<TResource, any, any>
  >();

  constructor(factory: () => TResource, concurrencyToken$: Observable<number>) {
    // Stream resources that are ready to pick up work
    const resourcesSubject = new Subject<TResource>();

    // Stream ongoing work.
    zip(resourcesSubject, this.todoSubject)
      .pipe(
        mergeMap(async ([resource, workItem]) => {
          await workItem.execute(resource);
          resourcesSubject.next(resource); // recycle resource so it can pick up more work
        }),
        ignoreElements(),
        takeUntil(this.dispose$),
      )
      .subscribe({
        error: (error) => {
          this.todoSubject.subscribe((workItem) => workItem.reject(error));
        },
      });

    // Create resources
    concurrencyToken$
      .pipe(
        takeUntil(this.dispose$),
        mergeMap(async () => {
          if (this.disposedSubject.value) {
            // Don't create new resources when disposed
            return;
          }
          const resource = factory();
          this.createdResources.push(resource);
          await resource.init?.();
          return resource;
        }, MAX_CONCURRENT_INIT),
        filter(notEmpty),
        tap({
          complete: () => {
            // Signal init complete
            this.initSubject.next();
            this.initSubject.complete();
          },
          error: (err) => {
            this.initSubject.error(err);
          },
        }),
      )
      .subscribe({
        next: (resource) => resourcesSubject.next(resource),
        error: (err) => resourcesSubject.error(err),
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
  public schedule<TIn, TOut>(
    input$: Observable<TIn>,
    task: (resource: TResource, input: TIn) => Promise<TOut> | TOut,
  ): Observable<TOut> {
    return input$.pipe(
      mergeMap((input) => {
        const workItem = new WorkItem(input, task);
        this.todoSubject.next(workItem);
        return workItem.result$;
      }),
    );
  }

  /**
   * Dispose the pool
   */
  public async dispose(): Promise<void> {
    if (!this.disposedSubject.value) {
      this.disposedSubject.next(true);
      this.todoSubject.subscribe((workItem) => workItem.complete());
      this.todoSubject.complete();
      await Promise.all(
        this.createdResources.map((resource) => resource.dispose?.()),
      );
    }
  }
}
