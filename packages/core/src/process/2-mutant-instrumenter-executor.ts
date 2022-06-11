import { execaCommand } from 'execa';
import { Injector, tokens, commonTokens, BaseContext } from '@stryker-mutator/api/plugin';
import { createInstrumenter, InstrumentResult } from '@stryker-mutator/instrumenter';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { Reporter } from '@stryker-mutator/api/src/report';
import { File, I } from '@stryker-mutator/util';

import { coreTokens } from '../di/index.js';
import { InputFileCollector } from '../input/index.js';
import { Sandbox } from '../sandbox/sandbox.js';
import { LoggingClientContext } from '../logging/index.js';
import { ConcurrencyTokenProvider, createCheckerPool } from '../concurrent/index.js';
import { createCheckerFactory } from '../checker/index.js';
import { createPreprocessor } from '../sandbox/index.js';
import { Timer } from '../utils/timer.js';
import { TemporaryDirectory } from '../utils/temporary-directory.js';
import { UnexpectedExitHandler } from '../unexpected-exit-handler.js';

import { DryRunContext } from './3-dry-run-executor.js';

export interface MutantInstrumenterContext extends BaseContext {
  [commonTokens.options]: StrykerOptions;
  [coreTokens.inputFiles]: InputFileCollector;
  [coreTokens.loggingContext]: LoggingClientContext;
  [coreTokens.reporter]: Required<Reporter>;
  [coreTokens.timer]: I<Timer>;
  [coreTokens.temporaryDirectory]: I<TemporaryDirectory>;
  [coreTokens.execa]: typeof execaCommand;
  [coreTokens.process]: NodeJS.Process;
  [coreTokens.unexpectedExitRegistry]: I<UnexpectedExitHandler>;
  [coreTokens.pluginModulePaths]: readonly string[];
}

export class MutantInstrumenterExecutor {
  public static readonly inject = tokens(commonTokens.injector, coreTokens.inputFiles, commonTokens.options);
  constructor(
    private readonly injector: Injector<MutantInstrumenterContext>,
    private readonly inputFiles: InputFileCollector,
    private readonly options: StrykerOptions
  ) {}

  public async execute(): Promise<Injector<DryRunContext>> {
    // Create the checker and instrumenter
    const instrumenter = this.injector.injectFunction(createInstrumenter);

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
