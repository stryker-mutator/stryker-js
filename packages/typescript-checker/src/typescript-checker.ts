import { EOL } from 'os';

import ts from 'typescript';
import { Checker, CheckResult, CheckStatus } from '@stryker-mutator/api/check';
import { tokens, commonTokens, PluginContext, Injector, Scope } from '@stryker-mutator/api/plugin';
import { Logger, LoggerFactoryMethod } from '@stryker-mutator/api/logging';
import { Mutant, StrykerOptions } from '@stryker-mutator/api/core';

import { HybridFileSystem } from './fs/index.js';
import * as pluginTokens from './plugin-tokens.js';
import { TypescriptCompiler } from './typescript-compiler.js';
import { createGroups } from './grouping/create-groups.js';

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
    .provideClass(pluginTokens.fs, HybridFileSystem)
    .provideClass(pluginTokens.tsCompiler, TypescriptCompiler)
    .injectClass(TypescriptChecker);
}

/**
 * An in-memory type checker implementation which validates type errors of mutants.
 */
export class TypescriptChecker implements Checker {
  private readonly currentErrors: ts.Diagnostic[] = [];
  /**
   * Keep track of all tsconfig files which are read during compilation (for project references)
   */

  public static inject = tokens(commonTokens.logger, commonTokens.options, pluginTokens.fs, pluginTokens.tsCompiler);

  constructor(
    private readonly logger: Logger,
    options: StrykerOptions,
    private readonly fs: HybridFileSystem,
    private readonly tsCompiler: TypescriptCompiler
  ) {}

  /**
   * Starts the typescript compiler and does a dry run
   */
  public async init(): Promise<void> {
    const errors = await this.tsCompiler.init();

    if (errors.length) {
      // todo
      // throw new Error(`TypeScript error(s) found in dry run compilation: ${this.formatErrors(errors)}`);
      throw new Error(`TypeScript error(s) found in dry run compilation: ${errors.length}`);
    }
  }

  /**
   * Checks whether or not a mutant results in a compile error.
   * Will simply pass through if the file mutated isn't part of the typescript project
   * @param mutant The mutant to check
   */
  public async check(mutants: Mutant[]): Promise<Record<string, CheckResult>> {
    const result: Record<string, CheckResult> = {};
    mutants.forEach((mutant) => {
      result[mutant.id] = {
        status: CheckStatus.Passed,
      };
    });
    const mutantErrorRelationMap = await this.checkErrors(mutants, {});
    for (const [id, errors] of Object.entries(mutantErrorRelationMap)) {
      result[id] = { status: CheckStatus.CompileError, reason: this.createErrorText(errors) };
    }
    return result;
  }

  public async group(mutants: Mutant[]): Promise<string[][]> {
    const nodes = this.tsCompiler.getFileRelation();
    const result = await createGroups(mutants, nodes);
    return result;
  }

  // string is id van de mutant
  private async checkErrors(mutants: Mutant[], errorsMap: Record<string, ts.Diagnostic[]>): Promise<Record<string, ts.Diagnostic[]>> {
    const errors = await this.tsCompiler.check(mutants);
    this.logger.info(`Found errors: ${errors.length}`);

    errors.forEach((error) => {
      if (mutants.length === 1) {
        if (errorsMap[mutants[0].id]) {
          errorsMap[mutants[0].id].push(error);
        } else {
          errorsMap[mutants[0].id] = [error];
        }
      } else {
        const nodeErrorWasThrownIn = this.tsCompiler.getFileRelation().find((node) => (node.fileName = error.file!.fileName));
        if (!nodeErrorWasThrownIn) {
          throw new Error('Error not found in any node');
        }
        const allNodesWrongMutantsCanBeIn = nodeErrorWasThrownIn.getAllChildReferencesIncludingSelf();
        const fileNamesToCheck: string[] = [];
        allNodesWrongMutantsCanBeIn.forEach((node) => {
          fileNamesToCheck.push(node.fileName);
        });
        const mutantsRelatedToError = mutants.filter((mutant) => {
          return fileNamesToCheck.includes(mutant.fileName);
        });
        if (mutantsRelatedToError.length === 1) {
          if (errorsMap[mutants[0].id]) {
            errorsMap[mutants[0].id].push(error);
          } else {
            errorsMap[mutants[0].id] = [error];
          }
        } else {
          mutantsRelatedToError.forEach(async (mutant) => {
            await this.checkErrors([mutant], errorsMap);
          });
        }
      }
    });
    return errorsMap;
  }

  private createErrorText(errors: ts.Diagnostic[]): string {
    return ts.formatDiagnostics(errors, {
      getCanonicalFileName: (fileName) => fileName,
      getCurrentDirectory: process.cwd,
      getNewLine: () => EOL,
    });
  }
}
