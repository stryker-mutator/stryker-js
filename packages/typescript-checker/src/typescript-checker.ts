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
import { toPosixFileName } from './tsconfig-helpers.js';
import { Node } from './grouping/node.js';

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
   * @param mutants The mutants to check
   */
  public async check(mutants: Mutant[]): Promise<Record<string, CheckResult>> {
    const result: Record<string, CheckResult> = {};

    mutants.forEach((mutant) => {
      result[mutant.id] = {
        status: CheckStatus.Passed,
      };
    });
    const mutantErrorRelationMap = await this.checkErrors(mutants, {}, this.tsCompiler.getFileRelationsAsNodes());
    for (const [id, errors] of Object.entries(mutantErrorRelationMap)) {
      result[id] = { status: CheckStatus.CompileError, reason: this.createErrorText(errors) };
    }

    return result;
  }

  /**
   * Creates groups of the mutants.
   * These groups will get send to the check method.
   * @param mutants All the mutants to group.
   */
  public async group(mutants: Mutant[]): Promise<string[][]> {
    // const e = mutants.filter((m) => m.fileName.includes('jest-test-adapter-factory.ts'));
    // const a = mutants.filter((m) => !m.fileName.includes('jest-test-adapter-factory.ts'));
    // const nodes = this.tsCompiler.getFileRelationsAsNodes();
    // const result1 = await createGroups(e, nodes);
    // const result2 = await createGroups(a, nodes);

    // return [...result1, ...result2];
    // return mutants.map((m) => [m.id]);
    const nodes = this.tsCompiler.getFileRelationsAsNodes();
    const result = await createGroups(mutants, nodes);
    return result;
  }

  // string is id van de mutant
  // todo make private
  public async checkErrors(mutants: Mutant[], errorsMap: Record<string, ts.Diagnostic[]>, nodes: Node[]): Promise<Record<string, ts.Diagnostic[]>> {
    if (mutants.filter((m) => m.id === '256').length) {
      debugger;
    }
    const errors = await this.tsCompiler.check(mutants);
    this.logger.info(`Found errors: ${errors.length}`);

    // if (mutants.filter((m) => m.fileName.includes('jest-test-adapter-factory.ts')).length) {
    //   debugger;
    // }

    for (const error of errors) {
      // errors.forEach((error) => {
      if (mutants.length === 1) {
        if (errorsMap[mutants[0].id]) {
          errorsMap[mutants[0].id].push(error);
        } else {
          errorsMap[mutants[0].id] = [error];
        }
      } else {
        const nodeErrorWasThrownIn = nodes.find((node) => (node.fileName = error.file!.fileName));
        if (!nodeErrorWasThrownIn) {
          throw new Error('Error not found in any node');
        }
        const allNodesWrongMutantsCanBeIn = nodeErrorWasThrownIn.getAllChildReferencesIncludingSelf();
        const fileNamesToCheck: string[] = [];

        allNodesWrongMutantsCanBeIn.forEach((node) => {
          fileNamesToCheck.push(node.fileName);
        });

        const mutantsRelatedToError = mutants.filter((mutant) => {
          // todo fix all posix
          return fileNamesToCheck.map((f) => toPosixFileName(f)).includes(toPosixFileName(mutant.fileName));
        });

        if (mutantsRelatedToError.length === 1) {
          if (errorsMap[mutants[0].id]) {
            errorsMap[mutants[0].id].push(error);
          } else {
            errorsMap[mutants[0].id] = [error];
          }
        } else if (mutantsRelatedToError.length === 0) {
          throw new Error('No related mutants found.');
        } else {
          for (const mutant of mutantsRelatedToError) {
            await this.checkErrors([mutant], errorsMap, nodes);
          }
          // mutantsRelatedToError.forEach(async (mutant) => {
          //   await this.checkErrors([mutant], errorsMap, nodes);
          // });
        }
      }
    }
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
