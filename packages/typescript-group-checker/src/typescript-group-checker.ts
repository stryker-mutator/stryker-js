import { EOL } from 'os';

import { Checker, CheckResult, CheckStatus } from '@stryker-mutator/api/check';
import { tokens, commonTokens, PluginContext, Injector, Scope } from '@stryker-mutator/api/plugin';

import { Mutant, StrykerOptions } from '@stryker-mutator/api/core';
import { Logger, LoggerFactoryMethod } from '@stryker-mutator/api/logging';

import ts from 'typescript';

import { errorToString, flatMap } from '@stryker-mutator/util';

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

  private graph: DependencyGraph = new DependencyGraph([]);

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
    const mutantResults: Array<{ mutant: Mutant; errors: ts.Diagnostic[] }> = mutants.map((mutant) => {
      return {
        mutant,
        errors: [],
      };
    });

    mutants.forEach((mutant) => this.mfs.getFile(mutant.fileName)?.mutate(mutant));
    const errors = await this.tsCompiler.check();
    mutants.forEach((mutant) => this.mfs.getFile(mutant.fileName)?.reset());

    const possibleMoreErrors = new Set<Mutant>();

    errors.forEach((error) => {
      const possibleMutants = this.matchMutantsFromError(mutants, error);
      if (possibleMutants.length === 1) {
        mutantResults[mutantResults.findIndex((mutantResult) => mutantResult.mutant.id === possibleMutants[0].id)].errors.push(error);
      } else if (possibleMutants.length > 1) {
        possibleMutants.forEach((mutant) => possibleMoreErrors.add(mutant));
      } else if (possibleMutants.length === 0) {
        throw new Error('Big Error! No mutants can be found');
      }
    });

    for (const mutant of possibleMoreErrors.values()) {
      const mutantResult = mutantResults[mutantResults.findIndex((mr) => mr.mutant.id === mutant.id)];
      if (mutantResult.errors.length > 0) continue;
      this.mfs.getFile(mutant.fileName)?.mutate(mutant);
      const mutantErrors = await this.tsCompiler.check();
      this.mfs.getFile(mutant.fileName)?.reset();

      mutantResult.errors = mutantErrors;
    }

    this.logger.info(`Checking ${mutants.length} mutations: found ${errors.length} errors`);

    return mutantResults.map((mutantResult) => {
      if (mutantResult.errors.length) {
        return {
          mutant: mutantResult.mutant,
          checkResult: {
            status: CheckStatus.CompileError,
            reason: this.formatErrors(mutantResult.errors),
          },
        };
      }

      return {
        mutant: mutantResult.mutant,
        checkResult: { status: CheckStatus.Passed },
      };
    });
  }

  private matchMutantsFromError(mutants: Mutant[], error: ts.Diagnostic): Mutant[] {
    const errorFileName = error.file?.fileName ?? '';

    const index = mutants.findIndex((mutant) => toPosixFileName(mutant.fileName) === errorFileName);
    if (index != -1) {
      return [mutants[index]];
    }

    const imports = this.graph.nodes[errorFileName].getAllImports();

    const posibleMutants: Mutant[] = [];

    imports.forEach((importFile) => {
      mutants.forEach((mutant) => {
        if (toPosixFileName(mutant.fileName) === importFile.fileName) {
          posibleMutants.push(mutant);
        }
      });
    });
    return posibleMutants;
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
