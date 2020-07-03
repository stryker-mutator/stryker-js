import { PartialStrykerOptions } from '@stryker-mutator/api/core';
import { MutantResult } from '@stryker-mutator/api/report';
import { rootInjector } from 'typed-inject';

import { LogConfigurator } from './logging';
import { PrepareExecutor, MutantInstrumenterExecutor, DryRunExecutor, MutationTestExecutor } from './process';
import { coreTokens } from './di';

/**
 * The main Stryker class.
 * It provides a single `runMutationTest()` function which runs mutation testing:
 */
export default class Stryker {
  /**
   * @constructor
   * @param cliOptions The cli options.
   * @param injector The root injector, for testing purposes only
   */
  constructor(private readonly cliOptions: PartialStrykerOptions, private readonly injector = rootInjector) {}

  public async runMutationTest(): Promise<MutantResult[]> {
    // 1. Prepare. Load Stryker configuration, load the input files and starts the logging server
    const prepareExecutor = this.injector.provideValue(coreTokens.cliOptions, this.cliOptions).injectClass(PrepareExecutor);
    const mutantInstrumenterInjector = await prepareExecutor.execute();

    // 2. Mutate and instrument the files and write to the sandbox.
    const mutantInstrumenter = mutantInstrumenterInjector.injectClass(MutantInstrumenterExecutor);
    const dryRunExecutorInjector = await mutantInstrumenter.execute();

    // 3. Perform a 'dry run' (initial test run). Runs the tests without active mutants and collects coverage.
    const dryRunExecutor = dryRunExecutorInjector.injectClass(DryRunExecutor);
    const mutationRunExecutorInjector = await dryRunExecutor.execute();
    try {
      // 4. Actual mutation testing. Will check every mutant and if valid run it in an available test runner.
      const mutationRunExecutor = mutationRunExecutorInjector.injectClass(MutationTestExecutor);
      const mutantResults = await mutationRunExecutor.execute();
      return mutantResults;
    } finally {
      await mutationRunExecutorInjector.dispose();
      await LogConfigurator.shutdown();
    }
  }
}
