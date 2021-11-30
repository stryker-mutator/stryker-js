import { EOL } from 'os';

import { Checker, CheckResult, CheckStatus } from '@stryker-mutator/api/check';
import { tokens, commonTokens, PluginContext, Injector, Scope } from '@stryker-mutator/api/plugin';

import { Mutant, StrykerOptions } from '@stryker-mutator/api/core';
import { Logger, LoggerFactoryMethod } from '@stryker-mutator/api/logging';

import ts from 'typescript';

import { flatMap } from '@stryker-mutator/util';

import * as pluginTokens from './plugin-tokens';
import { MemoryFileSystem } from './fs/memory-filesystem';
import { GroupBuilder, createGroups } from './group';
import { toPosixFileName } from './fs/tsconfig-helpers';
import { CompilerWithWatch } from './compilers/compiler-with-watch';
import { DependencyGraph } from './graph/dependency-graph';
import { DependencyNode } from './graph/dependency-node';

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
    .provideClass(pluginTokens.tsCompiler, CompilerWithWatch)
    .injectClass(TypescriptChecker);
}

/**
 * An in-memory type checker implementation which validates type errors of mutants.
 */
export class TypescriptChecker implements Checker {
  public static inject = tokens(commonTokens.logger, pluginTokens.tsCompiler, pluginTokens.mfs, commonTokens.options);
  private readonly groupBuilder: GroupBuilder;

  private graph: DependencyGraph | undefined;

  constructor(
    private readonly logger: Logger,
    private readonly tsCompiler: CompilerWithWatch,
    private readonly mfs: MemoryFileSystem,
    options: StrykerOptions
  ) {
    this.groupBuilder = new GroupBuilder(mfs);
    this.logger.info('Typescript group check');
  }

  public async init(): Promise<void> {
    const { dependencyFiles, errors } = await this.tsCompiler.init();

    if (errors.length) {
      throw new Error('Dry run error');
    }

    this.graph = new DependencyGraph(dependencyFiles);
  }

  public async check(mutants: Mutant[]): Promise<Array<{ mutant: Mutant; checkResult: CheckResult }>> {
    this.groupBuilder.createTreeFromMutants(mutants);
    mutants.forEach((mutant) => this.mfs.getFile(mutant.fileName)?.mutate(mutant));
    const errors = await this.tsCompiler.check();
    this.logger.info(`Checking ${mutants.length} mutations: found ${errors.length} errors`);

    const notMatchedErrors = this.getNotMatchedErrors(mutants, errors);
    const mutantsWithoutErrors = this.getMutantsWithoutErrors(mutants, errors);
    const unsureMutants: Mutant[] = [];

    notMatchedErrors.forEach((error) => {
      if (!this.graph) return;

      const errorFileName = error.file?.fileName ?? '';

      if (errorFileName in this.graph) {
        const allImports = this.graph.nodes[errorFileName].getAllImports().map((importDependency) => importDependency.fileName);
        mutantsWithoutErrors.forEach((mutantWithoutErrors) => {
          if (allImports.includes(mutantWithoutErrors.fileName)) {
            unsureMutants.push(mutantWithoutErrors);
          }
        });
      }
    });

    const newLocal = 0;
    for (let i = newLocal; i < unsureMutants.length; i++) {
      this.check([unsureMutants[i]]);
    }

    const { matchedErrors, unMatchedErrors } = this.matchErrorsWithMutant(mutants, errors);
    mutants.forEach((mutant) => this.mfs.getFile(mutant.fileName)?.reset());
    // if (unMatchedErrors.length) throw new Error('Could not match error');

    return mutants.map((mutant) => ({
      mutant,
      checkResult: this.getResult(flatMap(matchedErrors.filter((e) => e.mutant.id === mutant.id).map((e) => e.errors))),
    }));
  }

  private getMutantsWithoutErrors(mutants: Mutant[], errors: ts.Diagnostic[]) {
    const errorFiles = errors.map((error) => error.file?.fileName ?? '');
    return mutants.filter((mutant) => {
      return errorFiles.includes(mutant.fileName);
    });
  }

  private getNotMatchedErrors(mutants: Mutant[], errors: ts.Diagnostic[]): ts.Diagnostic[] {
    const mutantFiles = mutants.map((mutant) => mutant.fileName);
    return errors.filter((error) => {
      const errorFileName = error.file?.fileName ?? '';
      return mutantFiles.includes(errorFileName);
    });
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
    if (this.graph) {
      return createGroups(this.graph, mutants);
    }

    throw new Error('Graph not created');
  }
}
