import { Checker, CheckResult, CheckStatus } from '@stryker-mutator/api/check';
import { Mutant } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { split } from '@stryker-mutator/util';

import * as pluginTokens from '../plugin-tokens.js';

import { formatDiagnostics } from './native-diagnostic.js';
import { NativeTypescriptCompiler } from './native-typescript-compiler.js';

/**
 * An experimental type checker implementation that uses the native TypeScript
 * compiler preview (TypeScript 7) to validate type errors of mutants.
 *
 * The native compiler API does not (yet) expose the dependency graph between files,
 * so mutants are always checked one-by-one. This is slower, but also more accurate,
 * since a reported error always belongs to the single mutant that is checked.
 */
export class NativeTypescriptChecker implements Checker {
  public static inject = tokens(commonTokens.logger, pluginTokens.tsCompiler);

  constructor(
    private readonly logger: Logger,
    private readonly tsCompiler: NativeTypescriptCompiler,
  ) {}

  /**
   * Starts the native typescript compiler and does a dry run
   */
  public async init(): Promise<void> {
    this.logger.info(
      'Using the experimental native TypeScript compiler preview (TypeScript 7) for type checking.',
    );
    const errors = await this.tsCompiler.init();
    if (errors.length) {
      throw new Error(
        `Typescript error(s) found in dry run compilation: ${formatDiagnostics(errors)}`,
      );
    }
  }

  /**
   * Checks whether or not the mutants result in a compile error.
   * Will simply pass through if a mutated file isn't part of the typescript project.
   * Mutants are checked one at a time, so reported errors always belong to the mutant being checked.
   * @param mutants The mutants to check
   */
  public async check(mutants: Mutant[]): Promise<Record<string, CheckResult>> {
    const result: Record<string, CheckResult> = {};
    for (const mutant of mutants) {
      result[mutant.id] = await this.checkSingle(mutant);
    }
    return result;
  }

  /**
   * Creates groups of the mutants. Mutants outside of the typescript project are grouped
   * together (they pass without type checking), all other mutants are checked one-by-one.
   * @param mutants All the mutants to group.
   */
  public group(mutants: Mutant[]): Promise<string[][]> {
    const [mutantsOutsideProject, mutantsInProject] = split(
      mutants,
      (mutant) => !this.tsCompiler.isProjectFile(mutant.fileName),
    );
    const groups = mutantsInProject.map((mutant) => [mutant.id]);
    if (mutantsOutsideProject.length) {
      return Promise.resolve([
        mutantsOutsideProject.map((mutant) => mutant.id),
        ...groups,
      ]);
    }
    return Promise.resolve(groups);
  }

  public dispose(): void {
    this.tsCompiler.dispose();
  }

  private async checkSingle(mutant: Mutant): Promise<CheckResult> {
    if (!this.tsCompiler.isProjectFile(mutant.fileName)) {
      return { status: CheckStatus.Passed };
    }
    const errors = await this.tsCompiler.check([mutant]);
    if (errors.length) {
      return {
        status: CheckStatus.CompileError,
        reason: formatDiagnostics(errors),
      };
    }
    return { status: CheckStatus.Passed };
  }
}
