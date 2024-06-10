import { createInjector } from 'typed-inject';
import { MutantResult, PartialStrykerOptions } from '@stryker-mutator/api/core';

import { provideLogger } from './../../di/provide-logger.js';
import { PrepareExecutor } from './../../process/1-prepare-executor.js';
import { MutantInstrumenterExecutor as ServerMutantInstrumenterExecutor } from './process/mutant-instrument-executor.js';

export class InstrumentMethod {
  /**
   * Get the mutant results for the given glob patterns, without running the mutation tests.
   * @param globPatterns The glob patterns to instrument.
   * @returns The mutant results.
   */
  public static async runInstrumentation(options: PartialStrykerOptions, injectorFactory = createInjector): Promise<MutantResult[]> {
    const rootInjector = injectorFactory();

    const loggerProvider = provideLogger(rootInjector);

    const prepareExecutor = loggerProvider.injectClass(PrepareExecutor);

    const mutantInstrumenterInjector = await prepareExecutor.execute(options);

    const mutantInstrumenter = mutantInstrumenterInjector.injectClass(ServerMutantInstrumenterExecutor);

    return await mutantInstrumenter.execute();
  }
}
