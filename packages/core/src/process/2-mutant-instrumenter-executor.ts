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
import {
  Mutant,
  MutantResult,
  StrykerOptions,
} from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import {
  CompleteDryRunResult,
  DryRunStatus,
} from '@stryker-mutator/api/test-runner';
import { Reporter } from '@stryker-mutator/api/report';
import { I, requireResolve } from '@stryker-mutator/util';

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
import { IncrementalDiffer, TestCoverage } from '../mutants/index.js';
import { MutationTestReportHelper } from '../reporters/mutation-test-report-helper.js';

import { DryRunContext } from './3-dry-run-executor.js';
import { NoMutantsToTestExecutor } from './no-mutants-to-test-executor.js';

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
    commonTokens.logger,
  );
  constructor(
    private readonly injector: Injector<MutantInstrumenterContext>,
    private readonly project: Project,
    private readonly options: StrykerOptions,
    private readonly pluginCreator: PluginCreator,
    private readonly log: Logger,
  ) {}

  /**
   * Instruments the files and prepares the dry run.
   * Resolves with the mutant results directly when there are no mutants to test.
   */
  public async execute(): Promise<Injector<DryRunContext> | MutantResult[]> {
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

    if (
      !this.options.dryRunOnly &&
      !hasMutantsToTest(instrumentResult.mutants)
    ) {
      this.log.info(
        'No mutants to test. Skipping the checkers, sandbox and initial test run.',
      );
      return this.reportWithoutTesting(instrumentResult.mutants);
    }

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

  private reportWithoutTesting(
    mutants: readonly Mutant[],
  ): Promise<MutantResult[]> {
    const dryRunResult: CompleteDryRunResult = {
      status: DryRunStatus.Complete,
      tests: [],
    };
    return this.injector
      .provideValue(coreTokens.mutants, mutants)
      .provideValue(coreTokens.dryRunResult, dryRunResult)
      .provideValue(coreTokens.requireFromCwd, requireResolve)
      .provideFactory(coreTokens.testCoverage, TestCoverage.from)
      .provideClass(coreTokens.incrementalDiffer, IncrementalDiffer)
      .provideClass(
        coreTokens.mutationTestReportHelper,
        MutationTestReportHelper,
      )
      .injectClass(NoMutantsToTestExecutor)
      .execute();
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

function hasMutantsToTest(mutants: readonly Mutant[]): boolean {
  return mutants.some(({ status }) => status !== 'Ignored');
}
