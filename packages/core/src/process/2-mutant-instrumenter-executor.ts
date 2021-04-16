import { Injector, tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { Instrumenter, InstrumentResult } from '@stryker-mutator/instrumenter';
import { File, StrykerOptions } from '@stryker-mutator/api/core';

import { MainContext, coreTokens } from '../di';
import { InputFileCollection } from '../input';
import { Sandbox } from '../sandbox/sandbox';
import { LoggingClientContext } from '../logging';

import { ConcurrencyTokenProvider, createCheckerPool } from '../concurrent';
import { createCheckerFactory } from '../checker/checker-facade';
import { createPreprocessor } from '../sandbox';

import { DryRunContext } from './3-dry-run-executor';

export interface MutantInstrumenterContext extends MainContext {
  [coreTokens.inputFiles]: InputFileCollection;
  [coreTokens.loggingContext]: LoggingClientContext;
}

export class MutantInstrumenterExecutor {
  public static readonly inject = tokens(commonTokens.injector, coreTokens.inputFiles, commonTokens.options);
  constructor(
    private readonly injector: Injector<MutantInstrumenterContext>,
    private readonly inputFiles: InputFileCollection,
    private readonly options: StrykerOptions
  ) {}

  public async execute(): Promise<Injector<DryRunContext>> {
    // Create the checker and instrumenter
    const instrumenter = this.injector.injectClass(Instrumenter);

    // Instrument files in-memory
    const instrumentResult = await instrumenter.instrument(this.inputFiles.filesToMutate, {
      ...this.options.mutator,
      mutationRanges: this.inputFiles.mutationRanges,
    });

    // Preprocess sandbox files
    const preprocess = this.injector.injectFunction(createPreprocessor);
    const files = await preprocess.preprocess(this.replaceInstrumentedFiles(instrumentResult));

    // Initialize the checker pool
    const concurrencyTokenProviderProvider = this.injector.provideClass(coreTokens.concurrencyTokenProvider, ConcurrencyTokenProvider);
    const concurrencyTokenProvider = concurrencyTokenProviderProvider.resolve(coreTokens.concurrencyTokenProvider);

    const checkerPoolProvider = concurrencyTokenProviderProvider
      .provideValue(coreTokens.checkerConcurrencyTokens, concurrencyTokenProvider.checkerToken$)
      .provideFactory(coreTokens.checkerFactory, createCheckerFactory)
      .provideFactory(coreTokens.checkerPool, createCheckerPool);
    const checkerPool = checkerPoolProvider.resolve(coreTokens.checkerPool);
    await checkerPool.init();

    // Feed the sandbox
    const dryRunProvider = checkerPoolProvider
      .provideValue(coreTokens.files, files)
      .provideClass(coreTokens.sandbox, Sandbox)
      .provideValue(coreTokens.mutants, instrumentResult.mutants);
    const sandbox = dryRunProvider.resolve(coreTokens.sandbox);
    await sandbox.init();
    return dryRunProvider;
  }

  private replaceInstrumentedFiles(instrumentResult: InstrumentResult): File[] {
    return this.inputFiles.files.map((inputFile) => {
      const instrumentedFileFound = instrumentResult.files.find((instrumentedFile) => instrumentedFile.name === inputFile.name);
      if (instrumentedFileFound) {
        return instrumentedFileFound;
      } else {
        return inputFile;
      }
    });
  }
}
