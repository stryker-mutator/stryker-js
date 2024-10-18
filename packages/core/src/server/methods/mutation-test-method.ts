import { createInjector } from 'typed-inject';
import { MutantResult, PartialStrykerOptions } from '@stryker-mutator/api/core';
import { commonTokens } from '@stryker-mutator/api/plugin';

import { MutationTestExecutor } from '../../process/4-mutation-test-executor.js';
import { provideLogger } from '../../di/provide-logger.js';
import { PrepareExecutor } from '../../process/1-prepare-executor.js';
import { MutantInstrumenterExecutor } from '../../process/2-mutant-instrumenter-executor.js';
import { Stryker } from '../../stryker.js';
import { BroadcastReporter } from '../../reporters/index.js';
import { DryRunExecutor } from '../../process/3-dry-run-executor.js';
import { coreTokens } from '../../di/index.js';
import { ConfigError, retrieveCause } from '../../errors.js';
import { LogConfigurator } from '../../logging/log-configurator.js';

export class MutationTestMethod {
  constructor(private readonly injectorFactory = createInjector) {}

  /**
   * Run a mutation test and get partial results via a callback.
   * @param globPatterns  The glob patterns to mutation test.
   * @param onMutantTested  A callback that is called when a mutant is tested.
   */
  public async runMutationTestRealtime(
    options: PartialStrykerOptions,
    abortSignal: AbortSignal,
    onMutantTested: (result: Readonly<MutantResult>) => void,
  ): Promise<void> {
    options.reporters = ['empty']; // used to stream results

    const rootInjector = this.injectorFactory();
    const loggerProvider = provideLogger(rootInjector);

    try {
      // 1. Prepare. Load Stryker configuration, load the input files and starts the logging server
      const prepareExecutor = loggerProvider.injectClass(PrepareExecutor);

      const mutantInstrumenterInjector = await prepareExecutor.execute(options);

      const broadcastReporter = mutantInstrumenterInjector.resolve(coreTokens.reporter) as BroadcastReporter;
      const emptyReporter = broadcastReporter.reporters.empty;
      if (!emptyReporter) {
        throw new Error('Reporter unavailable');
      }

      emptyReporter.onMutantTested = onMutantTested;
      try {
        // 2. Mutate and instrument the files and write to the sandbox.
        const mutantInstrumenter = mutantInstrumenterInjector.injectClass(MutantInstrumenterExecutor);
        const dryRunExecutorInjector = await mutantInstrumenter.execute();

        // 3. Perform a 'dry run' (initial test run). Runs the tests without active mutants and collects coverage.
        const dryRunExecutor = dryRunExecutorInjector.injectClass(DryRunExecutor);
        const mutationRunExecutorInjector = (await dryRunExecutor.execute()).provideValue(commonTokens.abortSignal, abortSignal);

        // 4. Actual mutation testing. Will check every mutant and if valid run it in an available test runner.
        const mutationRunExecutor = mutationRunExecutorInjector.injectClass(MutationTestExecutor);

        await mutationRunExecutor.execute();
      } catch (error) {
        if (mutantInstrumenterInjector.resolve(commonTokens.options).cleanTempDir !== 'always') {
          const log = loggerProvider.resolve(commonTokens.getLogger)(Stryker.name);
          log.debug('Not removing the temp dir because an error occurred');
          mutantInstrumenterInjector.resolve(coreTokens.temporaryDirectory).removeDuringDisposal = false;
        }
        throw error;
      }
    } catch (error) {
      const log = loggerProvider.resolve(commonTokens.getLogger)(Stryker.name);
      const cause = retrieveCause(error);
      if (cause instanceof ConfigError) {
        log.error(cause.message);
      } else {
        log.error('Unexpected error occurred while running Stryker', error);
        log.info('This might be a known problem with a solution documented in our troubleshooting guide.');
        log.info('You can find it at https://stryker-mutator.io/docs/stryker-js/troubleshooting/');
        if (!log.isTraceEnabled()) {
          log.info(
            'Still having trouble figuring out what went wrong? Try `npx stryker run --fileLogLevel trace --logLevel debug` to get some more info.',
          );
        }
      }
      throw cause;
    } finally {
      await rootInjector.dispose();
      await LogConfigurator.shutdown();
    }
  }

  /**
   * Run a mutation test.
   * @param globPatterns The glob patterns to mutation test.
   * @returns The mutant results.
   */
  public static async runMutationTest(abortSignal: AbortSignal, options: PartialStrykerOptions): Promise<MutantResult[]> {
    return await new Stryker(options).runMutationTest(abortSignal);
  }
}
