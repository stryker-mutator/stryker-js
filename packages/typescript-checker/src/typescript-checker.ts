import { EOL } from 'os';

import ts from 'typescript';
import { Checker, CheckResult, CheckStatus } from '@stryker-mutator/api/check';
import { tokens, commonTokens, PluginContext, Injector, Scope } from '@stryker-mutator/api/plugin';
import { Logger, LoggerFactoryMethod } from '@stryker-mutator/api/logging';
import { Mutant, StrykerOptions } from '@stryker-mutator/api/core';
import { split, strykerReportBugUrl } from '@stryker-mutator/util';

import * as pluginTokens from './plugin-tokens.js';
import { TypescriptCompiler } from './typescript-compiler.js';
import { createGroups } from './grouping/create-groups.js';
import { toPosixFileName } from './tsconfig-helpers.js';
import { TSFileNode } from './grouping/ts-file-node.js';
import { TypescriptCheckerOptionsWithStrykerOptions } from './typescript-checker-options-with-stryker-options.js';
import { HybridFileSystem } from './fs/hybrid-file-system.js';

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

  public static inject = tokens(commonTokens.logger, commonTokens.options, pluginTokens.tsCompiler);
  private readonly options: TypescriptCheckerOptionsWithStrykerOptions;

  constructor(
    private readonly logger: Logger,
    options: StrykerOptions,
    private readonly tsCompiler: TypescriptCompiler,
  ) {
    this.options = options as TypescriptCheckerOptionsWithStrykerOptions;
  }

  /**
   * Starts the typescript compiler and does a dry run
   */
  public async init(): Promise<void> {
    const errors = await this.tsCompiler.init();

    if (errors.length) {
      throw new Error(`Typescript error(s) found in dry run compilation: ${this.createErrorText(errors)}`);
    }
  }

  /**
   * Checks whether or not a mutant results in a compile error.
   * Will simply pass through if the file mutated isn't part of the typescript project
   * @param mutants The mutants to check
   */
  public async check(mutants: Mutant[]): Promise<Record<string, CheckResult>> {
    const result: Record<string, CheckResult> = Object.fromEntries(mutants.map((mutant) => [mutant.id, { status: CheckStatus.Passed }]));

    // Check if this is the group with unrelated files and return check status passed if so
    if (!this.tsCompiler.nodes.get(toPosixFileName(mutants[0].fileName))) {
      return result;
    }

    const mutantErrorRelationMap = await this.checkErrors(mutants, {}, this.tsCompiler.nodes);
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
    if (!this.options.typescriptChecker.prioritizePerformanceOverAccuracy) {
      return mutants.map((m) => [m.id]);
    }
    const { nodes } = this.tsCompiler;
    const [mutantsOutsideProject, mutantsInProject] = split(mutants, (m) => nodes.get(toPosixFileName(m.fileName)) == null);

    const groups = createGroups(mutantsInProject, nodes);
    if (mutantsOutsideProject.length) {
      return [mutantsOutsideProject.map((m) => m.id), ...groups];
    } else {
      return groups;
    }
  }

  private async checkErrors(
    mutants: Mutant[],
    errorsMap: Record<string, ts.Diagnostic[]>,
    nodes: Map<string, TSFileNode>,
  ): Promise<Record<string, ts.Diagnostic[]>> {
    const errors = await this.tsCompiler.check(mutants);
    const mutantsThatCouldNotBeTestedInGroups = new Set<Mutant>();

    //If there is only a single mutant the error has to originate from the single mutant
    if (errors.length && mutants.length === 1) {
      errorsMap[mutants[0].id] = errors;
      return errorsMap;
    }

    for (const error of errors) {
      if (!error.file?.fileName) {
        throw new Error(
          `Typescript error: '${
            error.messageText
          }' was reported without a corresponding file. This shouldn't happen. Please open an issue using this link: ${strykerReportBugUrl(
            `[BUG]: TypeScript checker reports compile error without a corresponding file: ${error.messageText}`,
          )}`,
        );
      }
      const nodeErrorWasThrownIn = nodes.get(error.file?.fileName);
      if (!nodeErrorWasThrownIn) {
        throw new Error(
          `Typescript error: '${error.messageText}' was reported in an unrelated file (${
            error.file.fileName
          }). This file is not part of your project, or referenced from your project. This shouldn't happen, please open an issue using this link: ${strykerReportBugUrl(
            `[BUG]: TypeScript checker reports compile error in an unrelated file: ${error.messageText}`,
          )}`,
        );
      }
      const mutantsRelatedToError = nodeErrorWasThrownIn.getMutantsWithReferenceToChildrenOrSelf(mutants);

      if (mutantsRelatedToError.length === 0) {
        // In rare cases there are no mutants related to the typescript error
        // Having to test all mutants individually to know which mutant thrown the error
        for (const mutant of mutants) {
          mutantsThatCouldNotBeTestedInGroups.add(mutant);
        }
      } else if (mutantsRelatedToError.length === 1) {
        // There is only one mutant related to the typescript error so we can add it to the errorsRelatedToMutant
        if (errorsMap[mutantsRelatedToError[0].id]) {
          errorsMap[mutantsRelatedToError[0].id].push(error);
        } else {
          errorsMap[mutantsRelatedToError[0].id] = [error];
        }
      } else {
        // If there are more than one mutants related to the error we should check them individually
        for (const mutant of mutantsRelatedToError) {
          mutantsThatCouldNotBeTestedInGroups.add(mutant);
        }
      }
    }

    if (mutantsThatCouldNotBeTestedInGroups.size) {
      //Because at this point the filesystem contains all the mutants from the group we need to reset back
      //to the original state of the files to make it possible to test the first mutant
      //if we wouldn't do this the first mutant would not be noticed by the compiler because it was already in the filesystem
      await this.tsCompiler.check([]);
    }
    for (const mutant of mutantsThatCouldNotBeTestedInGroups) {
      if (errorsMap[mutant.id]) continue;
      await this.checkErrors([mutant], errorsMap, nodes);
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
