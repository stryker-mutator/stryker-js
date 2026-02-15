import os from 'os';

import { StrykerOptions } from '@stryker-mutator/api/core';
import { ReplaySubject, Observable, range } from 'rxjs';
import { Disposable, tokens } from 'typed-inject';
import { commonTokens } from '@stryker-mutator/api/plugin';
import { Logger } from '@stryker-mutator/api/logging';

export class ConcurrencyTokenProvider implements Disposable {
  private readonly concurrencyCheckers: number;
  private readonly concurrencyTestRunners: number;
  private readonly testRunnerTokenSubject = new ReplaySubject<number>();

  public get testRunnerToken$(): Observable<number> {
    return this.testRunnerTokenSubject;
  }
  public readonly checkerToken$: Observable<number>;
  public static readonly inject = tokens(
    commonTokens.options,
    commonTokens.logger,
  );

  constructor(
    options: Pick<StrykerOptions, 'checkers' | 'concurrency'>,
    private readonly log: Logger,
  ) {
    const availableParallelism = os.availableParallelism();
    const concurrency = this.computeConcurrency(
      options.concurrency,
      availableParallelism,
    );
    if (options.checkers.length > 0) {
      this.concurrencyCheckers = Math.max(Math.ceil(concurrency / 2), 1);
      this.checkerToken$ = range(this.concurrencyCheckers);
      this.concurrencyTestRunners = Math.max(Math.floor(concurrency / 2), 1);
      log.info(
        'Creating %s checker process(es) and %s test runner process(es).',
        this.concurrencyCheckers,
        this.concurrencyTestRunners,
      );
    } else {
      this.concurrencyCheckers = 0;
      this.checkerToken$ = range(1); // at least one checker, the `CheckerFacade` will not create worker process.
      this.concurrencyTestRunners = concurrency;
      log.info(
        'Creating %s test runner process(es).',
        this.concurrencyTestRunners,
      );
    }
    Array.from({ length: this.concurrencyTestRunners }).forEach(() =>
      this.testRunnerTokenSubject.next(this.tick()),
    );
  }

  private computeConcurrency(
    concurrencyOption: number | string | undefined,
    availableParallelism: number,
  ): number {
    if (typeof concurrencyOption === 'string') {
      const percentageMatch = concurrencyOption.match(/^(100|[1-9]?[0-9])%$/);
      if (percentageMatch) {
        const percentage = parseInt(percentageMatch[1], 10);
        const computed = Math.max(
          1,
          Math.round((availableParallelism * percentage) / 100),
        );
        this.log.debug(
          'Computed concurrency %s from "%s" based on %s available parallelism.',
          computed,
          concurrencyOption,
          availableParallelism,
        );
        return computed;
      }
    }
    if (typeof concurrencyOption === 'number') {
      return concurrencyOption;
    }
    // Default: n-1 for n > 4, else n
    return availableParallelism > 4
      ? availableParallelism - 1
      : availableParallelism;
  }

  public freeCheckers(): void {
    if (this.concurrencyCheckers > 0) {
      this.log.debug(
        'Checking done, creating %s additional test runner process(es)',
        this.concurrencyCheckers,
      );
      for (let i = 0; i < this.concurrencyCheckers; i++) {
        this.testRunnerTokenSubject.next(this.tick());
      }
      this.testRunnerTokenSubject.complete();
    }
  }

  private count = 0;
  private tick() {
    return this.count++;
  }

  public dispose(): void {
    this.testRunnerTokenSubject.complete();
  }
}
