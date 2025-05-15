import type { execaCommand } from 'execa';
import {
  Injector,
  tokens,
  commonTokens,
  PluginContext,
  PluginKind,
} from '@stryker-mutator/api/plugin';
import {
  createInstrumenter,
  InstrumentResult,
} from '@stryker-mutator/instrumenter';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { Reporter } from '@stryker-mutator/api/report';
import { I } from '@stryker-mutator/util';

import { coreTokens, PluginCreator } from '../di/index.js';
import { Sandbox } from '../sandbox/sandbox.js';
import {
  ConcurrencyTokenProvider,
  createCheckerPool,
} from '../concurrent/index.js';
import { createCheckerFactory } from '../checker/index.js';
import { createPreprocessor } from '../sandbox/index.js';
import { Timer } from '../utils/timer.js';
import { TemporaryDirectory } from '../utils/temporary-directory.js';
import { UnexpectedExitHandler } from '../unexpected-exit-handler.js';
import { FileSystem, Project } from '../fs/index.js';
import { IdGenerator } from '../child-proxy/id-generator.js';

import { DryRunContext } from './3-dry-run-executor.js';

export interface MutantInstrumenterContext extends PluginContext {
  [commonTokens.options]: StrykerOptions;
  [coreTokens.project]: Project;
  [coreTokens.reporter]: Required<Reporter>;
  [coreTokens.timer]: I<Timer>;
  [coreTokens.temporaryDirectory]: I<TemporaryDirectory>;
  [coreTokens.execa]: typeof execaCommand;
  [coreTokens.process]: NodeJS.Process;
  [coreTokens.unexpectedExitRegistry]: I<UnexpectedExitHandler>;
  [coreTokens.pluginModulePaths]: readonly string[];
  [coreTokens.fs]: I<FileSystem>;
  [coreTokens.pluginCreator]: PluginCreator;
  [coreTokens.loggingServerAddress]: { port: number };
}

export class MutantInstrumenterExecutor {
  public static readonly inject = tokens(
    commonTokens.injector,
    coreTokens.project,
    commonTokens.options,
    coreTokens.pluginCreator,
  );
  constructor(
    private readonly injector: Injector<MutantInstrumenterContext>,
    private readonly project: Project,
    private readonly options: StrykerOptions,
    private readonly pluginCreator: PluginCreator,
  ) {}

  public async execute(): Promise<Injector<DryRunContext>> {
    // Create the checker and instrumenter
    const instrumenter = this.injector.injectFunction(createInstrumenter);

    // Instrument files in-memory
    const ignorers = this.options.ignorers.map((name) =>
      this.pluginCreator.create(PluginKind.Ignore, name),
    );
    const instrumentResult = await instrumenter.instrument(
      await this.readFilesToMutate(),
      { ignorers, ...this.options.mutator },
    );

    // Preprocess the project
    const preprocess = this.injector.injectFunction(createPreprocessor);
    this.writeInstrumentedFiles(instrumentResult);
    await preprocess.preprocess(this.project);

    // Initialize the checker pool
    const concurrencyTokenProviderProvider = this.injector.provideClass(
      coreTokens.concurrencyTokenProvider,
      ConcurrencyTokenProvider,
    );
    const concurrencyTokenProvider = concurrencyTokenProviderProvider.resolve(
      coreTokens.concurrencyTokenProvider,
    );

    const checkerPoolProvider = concurrencyTokenProviderProvider
      .provideValue(
        coreTokens.checkerConcurrencyTokens,
        concurrencyTokenProvider.checkerToken$,
      )
      .provideClass(coreTokens.workerIdGenerator, IdGenerator)
      .provideFactory(coreTokens.checkerFactory, createCheckerFactory)
      .provideFactory(coreTokens.checkerPool, createCheckerPool);
    const checkerPool = checkerPoolProvider.resolve(coreTokens.checkerPool);
    await checkerPool.init();

    // Feed the sandbox
    const dryRunProvider = checkerPoolProvider
      .provideClass(coreTokens.sandbox, Sandbox)
      .provideValue(coreTokens.mutants, instrumentResult.mutants);
    const sandbox = dryRunProvider.resolve(coreTokens.sandbox);
    await sandbox.init();
    return dryRunProvider;
  }

  private readFilesToMutate() {
    return Promise.all(
      [...this.project.filesToMutate.values()].map((file) =>
        file.toInstrumenterFile(),
      ),
    );
  }

  private writeInstrumentedFiles(instrumentResult: InstrumentResult): void {
    for (const { name, content } of Object.values(instrumentResult.files)) {
      this.project.files.get(name)!.setContent(content);
    }
  }
}
