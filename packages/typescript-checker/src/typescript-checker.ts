import { EOL } from 'os';

import ts from 'typescript';
import { Checker, CheckResult, CheckStatus } from '@stryker-mutator/api/check';
import { tokens, commonTokens, PluginContext, Injector, Scope } from '@stryker-mutator/api/plugin';
import { Logger, LoggerFactoryMethod } from '@stryker-mutator/api/logging';
import { Mutant, StrykerOptions } from '@stryker-mutator/api/core';

import { TypeScriptCheckerOptions } from '../src-generated/typescript-checker-options.js';

import * as pluginTokens from './plugin-tokens.js';
import { TypescriptCompiler } from './typescript-compiler.js';
import { createGroups } from './grouping/create-groups.js';
import { toPosixFileName } from './tsconfig-helpers.js';
import { Node } from './grouping/node.js';
import { TypeScriptCheckerOptionsWithStrykerOptions } from './typescript-checker-options-with-stryker-options.js';
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
  private readonly typeScriptCheckeroptions: TypeScriptCheckerOptions;

  constructor(private readonly logger: Logger, options: StrykerOptions, private readonly tsCompiler: TypescriptCompiler) {
    this.typeScriptCheckeroptions = this.loadSetup(options);
  }

  /**
   * Starts the typescript compiler and does a dry run
   */
  public async init(): Promise<void> {
    const errors = await this.tsCompiler.init();

    if (errors.length) {
      throw new Error(`TypeScript error(s) found in dry run compilation: ${this.createErrorText(errors)}`);
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

    // Check if this is the group with unrelated files and return al
    if (!this.tsCompiler.getFileRelationsAsNodes().get(toPosixFileName(mutants[0].fileName))) {
      return result;
    }

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
    if (this.typeScriptCheckeroptions.typeScriptChecker.strategy === 'noGrouping') {
      return [mutants.map((m) => m.id)];
    }
    const nodes = this.tsCompiler.getFileRelationsAsNodes();

    const mutantsOutSideProject = mutants.filter((m) => nodes.get(toPosixFileName(m.fileName)) == null).map((m) => m.id);
    const mutantsToTest = mutants.filter((m) => nodes.get(toPosixFileName(m.fileName)) != null);

    const groups = createGroups(mutantsToTest, nodes);
    const sortedGroups = groups.sort((a, b) => b.length - a.length);
    const result = mutantsOutSideProject.length ? [mutantsOutSideProject, ...sortedGroups] : sortedGroups;

    this.logger.info(`Created ${result.length} groups with largest group of ${result[0].length} mutants`);
    return result;
  }

  private async checkErrors(
    mutants: Mutant[],
    errorsMap: Record<string, ts.Diagnostic[]>,
    nodes: Map<string, Node>
  ): Promise<Record<string, ts.Diagnostic[]>> {
    const errors = await this.tsCompiler.check(mutants);
    const mutantsThatCouldNotBeTestedInGroups = new Set<Mutant>();

    //If there is only a single mutant the error has to originate from the single mutant
    if (errors.length && mutants.length === 1) {
      errorsMap[mutants[0].id] = errors;
      return errorsMap;
    }

    for (const error of errors) {
      const nodeErrorWasThrownIn = nodes.get(error.file?.fileName ?? '');
      if (!nodeErrorWasThrownIn) {
        throw new Error('Error not found in any node');
      }
      const mutantsRelatedToError = nodeErrorWasThrownIn.getMutantsWithReferenceToChildrenOrSelf(mutants);

      if (mutantsRelatedToError.length === 1) {
        if (errorsMap[mutantsRelatedToError[0].id]) {
          errorsMap[mutantsRelatedToError[0].id].push(error);
        } else {
          errorsMap[mutantsRelatedToError[0].id] = [error];
        }
      } else if (mutantsRelatedToError.length === 0) {
        for (const mutant of mutants) {
          mutantsThatCouldNotBeTestedInGroups.add(mutant);
        }
      } else {
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

  private loadSetup(options: StrykerOptions): TypeScriptCheckerOptions {
    const defaultTypeScriptCheckerConfig: TypeScriptCheckerOptions = {
      typeScriptChecker: { strategy: 'noGrouping' },
    };
    return Object.assign(defaultTypeScriptCheckerConfig, (options as TypeScriptCheckerOptionsWithStrykerOptions).typeScriptChecker);
  }
}
