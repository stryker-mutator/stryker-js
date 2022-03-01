import { lastValueFrom, Observable, Subject, merge, zip } from 'rxjs';
import { mergeMap, filter, shareReplay, tap } from 'rxjs/operators';
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
  private readonly createdResources: TResource[] = [];
  private readonly resource$: Observable<TResource>;

  constructor(factory: () => TResource, concurrencyToken$: Observable<number>) {
    this.resource$ = concurrencyToken$.pipe(
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
  }

  /**
   * Returns a promise that resolves if all concurrency tokens have resulted in initialized resources.
   * This is optional, resources will get initialized either way.
   */
  public async init(): Promise<void> {
    await lastValueFrom(this.resource$);
  }

  /**
   * Schedules a task to be executed on resources in the pool. Each input is paired with a resource, which allows async work to be done.
   * @param input$ The inputs to pair up with a resource.
   * @param task The task to execute on each resource
   */
  public schedule<TIn, TOut>(input$: Observable<TIn>, task: (resource: TResource, input: TIn) => Promise<TOut> | TOut): Observable<TOut> {
    const recycleBin = new Subject<TResource>();
    const resource$ = merge(recycleBin, this.resource$);

    return zip(resource$, input$).pipe(
      mergeMap(async ([resource, input]) => {
        const output = await task(resource, input);
        //  Recycles a resource so its re-emitted from the `resource$` observable.
        recycleBin.next(resource);
        return output;
      }),
      tap({ complete: () => recycleBin.complete() })
    );
  }

  private isDisposed = false;

  /**
   * Dispose the pool
   */
  public async dispose(): Promise<void> {
    this.isDisposed = true;
    await Promise.all(this.createdResources.map((resource) => resource.dispose?.()));
  }
}
