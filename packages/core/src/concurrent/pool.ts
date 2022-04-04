import {
  mergeMap,
  filter,
  shareReplay,
  switchMap,
  lastValueFrom,
  Observable,
  Subject,
  merge,
  zip,
  Observer,
  ignoreElements,
  Subscription,
} from 'rxjs';
import { notEmpty } from '@stryker-mutator/util';
import { Disposable, tokens } from 'typed-inject';
import { TestRunner } from '@stryker-mutator/api/test-runner';

import { coreTokens } from '../di/index.js';
import { CheckerFacade } from '../checker/index.js';

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
 * Represents a pool of resources. Use `schedule` to schedule work to be executed on the resources.
 * The pool will automatically recycle the resources, but will make sure only one task is executed
 * on one resource at any one time. Creates as many resources as the concurrency tokens allow.
 * Also takes care of the initialing of the resources (with `init()`)
 */
export class Pool<TResource extends Resource> implements Disposable {
  private readonly recycledResource$ = new Subject<TResource>();
  private readonly createdResources: TResource[] = [];
  private readonly createdResource$: Observable<TResource>;
  private readonly freeResource$: Observable<TResource>;
  private readonly queuedWorkItem$ = new Subject<{
    execute(resource: TResource): any;
    observer: Observer<any>;
  }>();

  private readonly subscription = new Subscription();

  private readonly doWork$: Observable<unknown>;

  constructor(factory: () => TResource, concurrencyToken$: Observable<number>) {
    this.createdResource$ = concurrencyToken$.pipe(
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
      // We use share replay here. This way the dry run can use a test runner that is later reused during mutation testing
      // https://www.learnrxjs.io/learn-rxjs/operators/multicasting/sharereplay
      shareReplay()
    );
    this.freeResource$ = merge(this.createdResource$, this.recycledResource$);
    this.doWork$ = zip(this.freeResource$, this.queuedWorkItem$).pipe(
      switchMap(async ([resource, work]) => {
        try {
          const result = await work.execute(resource);
          work.observer.next(result);
          work.observer.complete();
        } catch (err) {
          work.observer.error(err);
        }
        this.recycledResource$.next(resource);
      }),
      ignoreElements()
    );
    this.subscription.add(this.doWork$.subscribe());
  }

  /**
   * Returns a promise that resolves if all concurrency tokens have resulted in initialized resources.
   * This is optional, resources will get initialized either way.
   */
  public async init(): Promise<void> {
    await lastValueFrom(this.createdResource$);
  }

  /**
   * Schedules a task to be executed on resources in the pool. Each input is paired with a resource, which allows async work to be done.
   * @param input$ The inputs to pair up with a resource.
   * @param task The task to execute on each resource
   */
  public schedule<TIn, TOut>(input$: Observable<TIn>, task: (resource: TResource, input: TIn) => Promise<TOut> | TOut): Observable<TOut> {
    return input$.pipe(
      //you can use mergeMap here as well, depends on how fast you want to consume inputs
      mergeMap((input) => {
        const work = {
          execute: (r: TResource) => task(r, input),
          observer: new Subject<TOut>(),
        };
        this.queuedWorkItem$.next(work);
        return work.observer;
      })
    );
  }

  private isDisposed = false;

  /**
   * Dispose the pool
   */
  public async dispose(): Promise<void> {
    this.isDisposed = true;
    this.subscription.unsubscribe();
    await Promise.all(this.createdResources.map((resource) => resource.dispose?.()));
  }
}
