import { cosmiconfig } from 'cosmiconfig';
import { ESLint } from 'eslint';
import fg from 'fast-glob';
import { Checker, CheckResult } from '@stryker-mutator/api/check';
import { Logger, LoggerFactoryMethod } from '@stryker-mutator/api/logging';
import { Mutant, StrykerOptions } from '@stryker-mutator/api/core';
import { tokens, commonTokens, PluginContext, Injector, Scope } from '@stryker-mutator/api/plugin';

import { isFailedResult, makeResultFromLintReport } from './result-helpers.js';
import { getConfig } from './esconfig-helpers.js';
import * as pluginTokens from './plugin-tokens.js';
import { CachedFs } from './fs/cached-fs.js';

const configLoader = cosmiconfig('eslint');

export class LintChecker implements Checker {
  private linter: ESLint;
  public static inject = tokens(commonTokens.logger, commonTokens.options, pluginTokens.fs);

  constructor(private readonly logger: Logger, private readonly options: StrykerOptions, private readonly fs: CachedFs) {
    this.linter = new ESLint();
  }

  private async lintFileContent(filename: string): Promise<CheckResult> {
    const fileText = await this.fs.getFile(filename);
    const results = await this.linter.lintText(fileText.content);
    const formatter = await this.linter.loadFormatter();
    return await makeResultFromLintReport(results, formatter);
  }

  public async init(): Promise<void> {
    this.logger.debug('Running initial lint check');
    const overrideConfig = await getConfig(configLoader, this.options.lintConfigFile as string | undefined);
    this.linter = new ESLint({ overrideConfig });

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
    const mutant = mutants[0];

    const asScriptFile = await this.fs.getFile(mutant.fileName);
    asScriptFile.mutate(mutant);

    const result = await this.lintFileContent(mutant.fileName);
    return {
      [mutant.id]: result,
    };
  }
}

lintCheckerLoggerFactory.inject = tokens(commonTokens.getLogger, commonTokens.target);
// eslint-disable-next-line @typescript-eslint/ban-types
function lintCheckerLoggerFactory(loggerFactory: LoggerFactoryMethod, target: Function | undefined) {
  const targetName = target?.name ?? LintChecker.name;
  const category = targetName === LintChecker.name ? LintChecker.name : `${LintChecker.name}.${targetName}`;
  return loggerFactory(category);
}

create.inject = tokens(commonTokens.injector);
export function create(injector: Injector<PluginContext>): LintChecker {
  return injector
    .provideFactory(commonTokens.logger, lintCheckerLoggerFactory, Scope.Transient)
    .provideClass(pluginTokens.fs, CachedFs)
    .injectClass(LintChecker);
}
