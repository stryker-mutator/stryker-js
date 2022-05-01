import { ESLint } from 'eslint';
import fg from 'fast-glob';
import { Checker, CheckResult } from '@stryker-mutator/api/check';
import { Logger } from '@stryker-mutator/api/logging';
import { Mutant, StrykerOptions } from '@stryker-mutator/api/core';
import { tokens, commonTokens, PluginContext, Injector } from '@stryker-mutator/api/plugin';
import { HybridFileSystem } from '@stryker-mutator/util';

import { isFailedResult, makeResultFromLintReport } from './result-helpers.js';
import { LINT_RULES_OVERRIDES } from './esconfig-helpers.js';
import * as pluginTokens from './plugin-tokens.js';

export class LintChecker implements Checker {
  private linter!: ESLint;
  public static inject = tokens(commonTokens.logger, commonTokens.options, pluginTokens.fs);

  constructor(private readonly logger: Logger, private readonly options: StrykerOptions, private readonly fs: HybridFileSystem) {}

  private readonly getFile = (filename: string) => {
    const scriptFile = this.fs.getFile(filename);
    if (scriptFile === undefined) throw new Error(`Unable to open file ${filename}`);

    scriptFile.watcher = () => {
      // no need to watch files with eslint
    };
    return scriptFile;
  };

  private async lintFileContent(filename: string): Promise<CheckResult> {
    const fileText = await this.getFile(filename);
    const results = await this.linter.lintText(fileText.content, { filePath: filename });
    const formatter = await this.linter.loadFormatter();
    return await makeResultFromLintReport(results, formatter);
  }

  public async init(): Promise<void> {
    this.logger.debug('Running initial lint check');
    this.linter = new ESLint({
      overrideConfig: {
        rules: LINT_RULES_OVERRIDES,
      },
      overrideConfigFile: this.options.lintConfigfile as string | undefined,
    });

    const fileNames = await fg(this.options.mutate);
    const allResults = await Promise.all(fileNames.map((fileName) => this.lintFileContent(fileName)));

    const errors = allResults.filter(isFailedResult);
    if (errors.length > 0) {
      const errorReasons = errors.map((e) => e.reason);
      throw new Error(['Lint error(s) found in dry run compilation:', ...errorReasons].join('\n'));
    }
    this.logger.debug('Initial lint check passed without errors');
  }

  public async check(mutants: Mutant[]): Promise<Record<string, CheckResult>> {
    if (mutants.length > 1) {
      throw new Error('Stryker implementation has changed and can now call check with multiple mutants. Please update eslint-checker');
    }

    const mutant = mutants[0];

    const asScriptFile = this.getFile(mutant.fileName);
    asScriptFile.mutate(mutant);

    const result = await this.lintFileContent(mutant.fileName);
    return {
      [mutant.id]: result,
    };
  }
}
create.inject = tokens(commonTokens.injector);
export function create(injector: Injector<PluginContext>): LintChecker {
  return injector.provideClass(pluginTokens.fs, HybridFileSystem).injectClass(LintChecker);
}
