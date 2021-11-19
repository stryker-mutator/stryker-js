import { EOL } from 'os';

import { Checker, CheckResult, CheckStatus } from '@stryker-mutator/api/check';
import { tokens, commonTokens, PluginContext, Injector, Scope } from '@stryker-mutator/api/plugin';

import { Mutant, StrykerOptions } from '@stryker-mutator/api/core';
import { Logger, LoggerFactoryMethod } from '@stryker-mutator/api/logging';

import ts from 'typescript';

import { flatMap } from '@stryker-mutator/util';

import { TypescriptCompiler } from './typescript-compiler';
import * as pluginTokens from './plugin-tokens';
import { MemoryFileSystem } from './fs/memory-filesystem';
import { GroupBuilder } from './group-builder';
import { toPosixFileName } from './fs/tsconfig-helpers';

const diagnosticsHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: (fileName) => fileName,
  getCurrentDirectory: process.cwd,
  getNewLine: () => EOL,
};

typescriptCheckerLoggerFactory.inject = tokens(commonTokens.getLogger, commonTokens.target);
// eslint-disable-next-line @typescript-eslint/ban-types
function typescriptCheckerLoggerFactory(loggerFactory: LoggerFactoryMethod, target: Function | undefined) {
  const targetName = target?.name ?? TypescriptChecker.name;
  const category = targetName === TypescriptChecker.name ? TypescriptChecker.name : `${TypescriptChecker.name}.${targetName}`;
  return loggerFactory(category);
}

create.inject = tokens(commonTokens.injector);
export function create(injector: Injector<PluginContext>): TypescriptChecker {
  return injector
    .provideFactory(commonTokens.logger, typescriptCheckerLoggerFactory, Scope.Transient)
    .provideClass(pluginTokens.mfs, MemoryFileSystem)
    .provideClass(pluginTokens.tsCompiler, TypescriptCompiler)
    .injectClass(TypescriptChecker);
}

/**
 * An in-memory type checker implementation which validates type errors of mutants.
 */
export class TypescriptChecker implements Checker {
  public static inject = tokens(commonTokens.logger, pluginTokens.tsCompiler, pluginTokens.mfs, commonTokens.options);
  private readonly groupBuilder: GroupBuilder;

  constructor(
    private readonly logger: Logger,
    private readonly tsCompiler: TypescriptCompiler,
    private readonly mfs: MemoryFileSystem,
    options: StrykerOptions
  ) {
    this.groupBuilder = new GroupBuilder(mfs);
    this.logger.info('Typescript group check');
  }

  public async init(): Promise<void> {
    const errors = await this.tsCompiler.check();

    if (errors.length) {
      throw new Error(`TypeScript error(s) found in dry run compilation: ${this.formatErrors(errors)}`);
    }
  }

  public async check(mutant: Mutant): Promise<CheckResult> {
    return {
      status: CheckStatus.Passed,
    };
  }

  public async checkGroup(mutants: Mutant[]): Promise<Array<{ mutant: Mutant; checkResult: CheckResult }>> {
    this.groupBuilder.createTreeFromMutants(mutants);
    mutants.forEach((mutant) => this.mfs.getFile(mutant.fileName)?.mutate(mutant));
    const errors = await this.tsCompiler.check();
    this.logger.info(`Checking ${mutants.length} mutations: found ${errors.length} errors`);
    const { matchedErrors, unMatchedErrors } = this.matchErrorsWithMutant(mutants, errors);
    mutants.forEach((mutant) => this.mfs.getFile(mutant.fileName)?.reset());
    // if (unMatchedErrors.length) throw new Error('Could not match error');

    return mutants.map((mutant) => ({
      mutant,
      checkResult: this.getResult(flatMap(matchedErrors.filter((e) => e.mutant.id === mutant.id).map((e) => e.errors))),
    }));
  }

  private matchErrorsWithMutant(
    mutants: Mutant[],
    errors: readonly ts.Diagnostic[]
  ): { matchedErrors: Array<{ mutant: Mutant; errors: readonly ts.Diagnostic[] }>; unMatchedErrors: readonly ts.Diagnostic[] } {
    const matchedErrors: Array<{ mutant: Mutant; errors: ts.Diagnostic[] }> = [];
    const unMatchedErrors: ts.Diagnostic[] = [];

    const addMatch = (mutant: Mutant, error: ts.Diagnostic) => {
      const mutantIndex = matchedErrors.findIndex((m) => m.mutant.id === mutant.id);

      if (mutantIndex >= 0) matchedErrors[mutantIndex].errors.push(error);
      else {
        matchedErrors.push({
          mutant,
          errors: [error],
        });
      }
    };

    errors.forEach((error) => {
      const index = mutants.findIndex((m) => toPosixFileName(m.fileName) === toPosixFileName(error.file?.fileName ?? ''));
      const mutant = mutants[index];

      if (mutant) {
        addMatch(mutant, error);
      } else {
        const match = this.groupBuilder.matchErrorWithGroup(mutants, error.file?.fileName ?? '');
        if (match.length === 1) {
          addMatch(match[0], error);
        } else if (match.length > 1) {
          unMatchedErrors.push(error);
        } else {
          this.logger.info('Fault is outside possible way');
          // throw new Error('Fault is outside possible way');
        }
      }
    });

    return {
      matchedErrors,
      unMatchedErrors,
    };
  }

  private getResult(errors: readonly ts.Diagnostic[]): CheckResult {
    if (errors.length) {
      return {
        status: CheckStatus.CompileError,
        reason: this.formatErrors(errors),
      };
    }

    return { status: CheckStatus.Passed };
  }

  private formatErrors(errors: readonly ts.Diagnostic[]): string {
    return ts.formatDiagnostics(errors, diagnosticsHost);
  }

  public async createGroups(mutants: Mutant[]): Promise<Mutant[][] | undefined> {
    this.logger.info('Creating groups!');
    return this.groupBuilder.getGroups(mutants);
  }
}
