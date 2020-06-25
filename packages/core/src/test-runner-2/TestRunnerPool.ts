import * as os from 'os';

import { tokens, commonTokens, Disposable } from '@stryker-mutator/api/plugin';
import { TestRunner2 } from '@stryker-mutator/api/test_runner2';
import { range, Observable, Subject } from 'rxjs';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { flatMap, filter, merge, shareReplay } from 'rxjs/operators';
import { notEmpty } from '@stryker-mutator/util';
import { Logger } from '@stryker-mutator/api/logging';

import { coreTokens } from '../di';

const MAX_CONCURRENT_INITIALIZING_TEST_RUNNERS = 2;

export class TestRunnerPool implements Disposable {
  private readonly allCreatedTestRunners: Array<Required<TestRunner2>> = [];

  private readonly testRunnerRecycleBin = new Subject<Required<TestRunner2>>();
  public readonly testRunner$ = this.createTestRunnerObservable().pipe(
    merge(this.testRunnerRecycleBin),
    // We use share replay here. This way the dry run can use a test runner that is later reused during mutation testing
    // https://www.learnrxjs.io/learn-rxjs/operators/multicasting/sharereplay
    shareReplay()
  );

  public static inject = tokens(coreTokens.testRunnerFactory, commonTokens.options, commonTokens.logger);
  constructor(
    private readonly testRunnerFactory: () => Required<TestRunner2>,
    private readonly options: StrykerOptions,
    private readonly log: Logger
  ) {}

  public recycle(testRunner: Required<TestRunner2>) {
    this.testRunnerRecycleBin.next(testRunner);
  }

  private createTestRunnerObservable(): Observable<Required<TestRunner2>> {
    return range(0, this.determineConcurrency()).pipe(
      flatMap(async (n) => {
        if (this.isDisposed) {
          return null;
        } else {
          this.log.debug('Creating test runner %s', n);
          const testRunner = this.testRunnerFactory();
          this.allCreatedTestRunners.push(testRunner);
          await testRunner.init();
          return testRunner;
        }
      }, MAX_CONCURRENT_INITIALIZING_TEST_RUNNERS),
      filter(notEmpty)
    );
  }

  private determineConcurrency() {
    let numConcurrentRunners = os.cpus().length;
    if (this.options.transpilers.length) {
      // If transpilers are configured, one core is reserved for the compiler (for now)
      numConcurrentRunners--;
    }
    let numConcurrentRunnersSource = 'CPU count';
    if (numConcurrentRunners > this.options.maxConcurrentTestRunners && this.options.maxConcurrentTestRunners > 0) {
      numConcurrentRunners = this.options.maxConcurrentTestRunners;
      numConcurrentRunnersSource = 'maxConcurrentTestRunners config';
    }
    if (numConcurrentRunners <= 0) {
      numConcurrentRunners = 1;
    }
    this.log.info(`Creating ${numConcurrentRunners} test runners (based on ${numConcurrentRunnersSource})`);
    return numConcurrentRunners;
  }

  private isDisposed = false;
  public async dispose(): Promise<void> {
    this.isDisposed = true;
    this.testRunnerRecycleBin.complete();
    await Promise.all(this.allCreatedTestRunners.map((testRunner) => testRunner.dispose()));
  }
}
