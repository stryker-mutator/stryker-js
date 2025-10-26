import { MutantResult, PartialStrykerOptions } from '@stryker-mutator/api/core';
import { createInjector, Injector } from 'typed-inject';
import { commonTokens } from '@stryker-mutator/api/plugin';

import {
  PrepareExecutor,
  MutantInstrumenterExecutor,
  DryRunExecutor,
  MutationTestExecutor,
  PrepareExecutorContext,
  PrepareExecutorArgs,
} from './process/index.js';
import { coreTokens } from './di/index.js';
import { retrieveCause, ConfigError } from './errors.js';
import {
  LoggingBackend,
  provideLogging,
  provideLoggingBackend,
} from './logging/index.js';

type MutationRunContext = PrepareExecutorContext & {
  [coreTokens.loggingSink]: LoggingBackend;
};

/**
 * The main Stryker class.
 * It provides a single `runMutationTest()` function which runs mutation testing:
 */
export class Stryker {
  /**
   * @constructor
   * @param cliOptions The cli options.
   * @param injectorFactory The injector factory, for testing purposes only
   */
  constructor(
    private readonly cliOptions: PartialStrykerOptions,
    private readonly injectorFactory = createInjector,
  ) {}

  public async runMutationTest(): Promise<MutantResult[]> {
    const rootInjector = this.injectorFactory();
    try {
      const prepareInjector = provideLogging(
        await provideLoggingBackend(rootInjector, process.stdout),
      ).provideValue(coreTokens.reporterOverride, undefined);
      return await Stryker.run(prepareInjector, {
        cliOptions: this.cliOptions,
        targetMutatePatterns: undefined,
      });
    } finally {
      await rootInjector.dispose();
    }
  }

  /**
   * Does the actual mutation testing.
   * Note: this is a public static method, so it can be reused from `StrykerServer`
   * @internal
   */
  static async run(
    mutationRunInjector: Injector<MutationRunContext>,
    args: PrepareExecutorArgs,
  ): Promise<MutantResult[]> {
    try {
      // 1. Prepare. Load Stryker configuration, load the input files
      const prepareExecutor = mutationRunInjector.injectClass(PrepareExecutor);
      const mutantInstrumenterInjector = await prepareExecutor.execute(args);

      try {
        // 2. Mutate and instrument the files and write to the sandbox.
        const mutantInstrumenter = mutantInstrumenterInjector.injectClass(
          MutantInstrumenterExecutor,
        );
        const dryRunExecutorInjector = await mutantInstrumenter.execute();

        // 3. Perform a 'dry run' (initial test run). Runs the tests without active mutants and collects coverage.
        const dryRunExecutor =
          dryRunExecutorInjector.injectClass(DryRunExecutor);
        const mutationRunExecutorInjector = await dryRunExecutor.execute();

        // 4. Actual mutation testing. Will check every mutant and if valid run it in an available test runner.
        const mutationRunExecutor =
          mutationRunExecutorInjector.injectClass(MutationTestExecutor);
        const mutantResults = await mutationRunExecutor.execute();

        return mutantResults;
      } catch (error) {
        if (
          mutantInstrumenterInjector.resolve(commonTokens.options)
            .cleanTempDir !== 'always'
        ) {
          const log = mutationRunInjector.resolve(commonTokens.getLogger)(
            Stryker.name,
          );
          log.debug('Not removing the temp dir because an error occurred');
          mutantInstrumenterInjector.resolve(
            coreTokens.temporaryDirectory,
          ).removeDuringDisposal = false;
        }
        throw error;
      }
    } catch (error) {
      const log = mutationRunInjector.resolve(commonTokens.getLogger)(
        Stryker.name,
      );
      const cause = retrieveCause(error);
      if (cause instanceof ConfigError) {
        log.error(cause.message);
      } else {
        log.error('Unexpected error occurred while running Stryker', error);
        log.info(
          'This might be a known problem with a solution documented in our troubleshooting guide.',
        );
        log.info(
          'You can find it at https://stryker-mutator.io/docs/stryker-js/troubleshooting/',
        );
        if (!log.isTraceEnabled()) {
          log.info(
            'Still having trouble figuring out what went wrong? Try `npx stryker run --fileLogLevel trace --logLevel debug` to get some more info.',
          );
        }
      }
      throw cause;
    }
  }
}
