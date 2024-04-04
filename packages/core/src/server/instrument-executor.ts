import { Injector, tokens, commonTokens, PluginKind } from '@stryker-mutator/api/plugin';
import { createInstrumenter } from '@stryker-mutator/instrumenter';
import { MutantResult, StrykerOptions } from '@stryker-mutator/api/core';

import { coreTokens, PluginCreator } from '../di/index.js';
import { Project } from '../fs/project.js';
import { MutantInstrumenterContext } from '../process/2-mutant-instrumenter-executor.js';

export class MutantInstrumenterExecutor {
  public static readonly inject = tokens(commonTokens.injector, coreTokens.project, commonTokens.options, coreTokens.pluginCreator);
  constructor(
    private readonly injector: Injector<MutantInstrumenterContext>,
    private readonly project: Project,
    private readonly options: StrykerOptions,
    private readonly pluginCreator: PluginCreator,
  ) {}

  public async execute(): Promise<MutantResult[]> {
    // Create the checker and instrumenter
    const instrumenter = this.injector.injectFunction(createInstrumenter);

    // Instrument files in-memory
    const ignorers = this.options.ignorers.map((name) => this.pluginCreator.create(PluginKind.Ignore, name));
    const instrumentResult = await instrumenter.instrument(await this.readFilesToMutate(), { ignorers, ...this.options.mutator });

    const mutantResults = instrumentResult.mutants.map((mutant) => ({
      ...mutant,
      status: mutant.status ?? 'Pending',
    }));

    return mutantResults;
  }

  private readFilesToMutate() {
    return Promise.all([...this.project.filesToMutate.values()].map((file) => file.toInstrumenterFile()));
  }
}
