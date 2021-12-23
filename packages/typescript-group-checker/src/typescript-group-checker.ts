import { EOL } from 'os';

import { Checker, CheckResult, CheckStatus } from '@stryker-mutator/api/check';
import { tokens, commonTokens, PluginContext, Injector } from '@stryker-mutator/api/plugin';

import { Mutant, MutantTestCoverage, StrykerOptions } from '@stryker-mutator/api/core';

import ts from 'typescript';

import * as pluginTokens from './plugin-tokens';
import { MemoryFileSystem } from './fs/memory-filesystem';
import { toPosixFileName } from './fs/tsconfig-helpers';
import { CompilerWithWatch } from './compilers/compiler-with-watch';
import { createGroups } from './group';
import { SourceFiles } from './compilers/compiler';

const diagnosticsHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: (fileName) => fileName,
  getCurrentDirectory: process.cwd,
  getNewLine: () => EOL,
};

create.inject = tokens(commonTokens.injector);
export function create(injector: Injector<PluginContext>): TypescriptChecker {
  return injector
    .provideClass(pluginTokens.fs, MemoryFileSystem)
    .provideClass(pluginTokens.tsCompiler, CompilerWithWatch)
    .injectClass(TypescriptChecker);
}

/**
 * An in-memory type checker implementation which validates type errors of mutants.
 */
export class TypescriptChecker implements Checker {
  public static inject = tokens(pluginTokens.tsCompiler, pluginTokens.fs, commonTokens.options);

  private sourceFiles: SourceFiles = {};

  constructor(private readonly tsCompiler: CompilerWithWatch, private readonly fs: MemoryFileSystem, options: StrykerOptions) {}

  public async init(): Promise<void> {
    const { dependencyFiles, errors } = await this.tsCompiler.init();

    if (errors.length) {
      throw new Error(`TypeScript error(s) found in dry run compilation: ${this.formatErrors(errors)}`);
    }

    this.sourceFiles = dependencyFiles;
  }

  public async check(mutants: MutantTestCoverage[]): Promise<Array<{ mutant: MutantTestCoverage; checkResult: CheckResult }>> {
    const mutantResults: Array<{ mutant: MutantTestCoverage; errors: ts.Diagnostic[] }> = mutants.map((mutant) => {
      return {
        mutant,
        errors: [],
      };
    });

    const errors = await this.typeCheckMutants(mutants);
    const mutantsToTestIndividual = new Set<Mutant>();

    errors.forEach((error) => {
      const possibleMutants = this.matchMutantsFromError(mutants, error);
      if (possibleMutants.length === 1) {
        mutantResults[mutantResults.findIndex((mutantResult) => mutantResult.mutant.id === possibleMutants[0].id)].errors.push(error);
      } else if (possibleMutants.length > 1) {
        possibleMutants.forEach((mutant) => mutantsToTestIndividual.add(mutant));
      } else if (possibleMutants.length === 0) {
        throw new Error('Error could not be matched to mutant.');
      }
    });

    for (const mutant of mutantsToTestIndividual.values()) {
      const mutantResult = mutantResults.find((mr) => mr.mutant.id === mutant.id);
      if (!mutantResult) throw new Error('Could not find mutant in mutant result');

      if (mutantResult.errors.length > 0) continue;

      mutantResult.errors = await this.typeCheckMutants([mutant]);
    }

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

  private async typeCheckMutants(mutants: Mutant[]) {
    mutants.forEach((mutant) => this.fs.getFile(mutant.fileName)?.mutate(mutant));
    const errors = await this.tsCompiler.check();
    mutants.forEach((mutant) => this.fs.getFile(mutant.fileName)?.reset());
    return errors;
  }

  private matchMutantsFromError(mutants: Mutant[], error: ts.Diagnostic): Mutant[] {
    const errorFileName = error.file?.fileName ?? '';

    const singleMutant = mutants.find((m) => toPosixFileName(m.fileName) === errorFileName);
    if (singleMutant) return [singleMutant];

    const imports = this.sourceFiles[errorFileName].imports;

    const possibleMutants: Mutant[] = [];

    mutants.forEach((mutant) => {
      const mutantFileName = toPosixFileName(mutant.fileName);

      imports.forEach((importFile) => {
        if (mutantFileName === importFile) {
          possibleMutants.push(mutant);
        }
      });
    });
    return possibleMutants;
  }

  private formatErrors(errors: readonly ts.Diagnostic[]): string {
    return ts.formatDiagnostics(errors, diagnosticsHost);
  }

  public async createGroups(mutants: MutantTestCoverage[]): Promise<MutantTestCoverage[][] | undefined> {
    return createGroups(this.sourceFiles, mutants).sort((a, b) => b.length - a.length);
  }
}
