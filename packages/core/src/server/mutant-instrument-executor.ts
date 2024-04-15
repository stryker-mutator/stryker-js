import { Injector, tokens, commonTokens, PluginKind } from '@stryker-mutator/api/plugin';
import { createInstrumenter } from '@stryker-mutator/instrumenter';
import { StrykerOptions } from '@stryker-mutator/api/core';

import { I } from '@stryker-mutator/util';

import { MutationTestResult } from 'mutation-testing-report-schema';

import { coreTokens, PluginCreator } from '../di/index.js';
import { Project } from '../fs/project.js';
import { MutantInstrumenterContext } from '../process/2-mutant-instrumenter-executor.js';
import { MutationTestReportHelper } from '../reporters/mutation-test-report-helper.js';

export class MutantInstrumenterExecutor {
  public static readonly inject = tokens(
    commonTokens.injector,
    coreTokens.project,
    commonTokens.options,
    coreTokens.pluginCreator,
    coreTokens.mutationTestReportHelper,
  );
  constructor(
    private readonly injector: Injector<MutantInstrumenterContext>,
    private readonly project: Project,
    private readonly options: StrykerOptions,
    private readonly pluginCreator: PluginCreator,
    private readonly mutationTestReportHelper: I<MutationTestReportHelper>,
  ) {}

  public async execute(): Promise<MutationTestResult> {
    const instrumenter = this.injector.injectFunction(createInstrumenter);

    // Instrument files in-memory
    const ignorers = this.options.ignorers.map((name) => this.pluginCreator.create(PluginKind.Ignore, name));
    const instrumentResult = await instrumenter.instrument(await this.readFilesToMutate(), { ignorers, ...this.options.mutator });

    // Map to MutantResults for the report
    const mutantResults = instrumentResult.mutants.map((mutant) => ({
      ...mutant,
      status: mutant.status ?? 'Pending',
    }));

    return await this.mutationTestReportHelper.mutationTestReport(mutantResults);
  }

  private readFilesToMutate() {
    return Promise.all([...this.project.filesToMutate.values()].map((file) => file.toInstrumenterFile()));
  }
}
