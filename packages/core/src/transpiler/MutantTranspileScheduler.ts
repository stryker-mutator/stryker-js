import { File } from '@stryker-mutator/api/core';
import { Disposable } from '@stryker-mutator/api/plugin';
import { tokens } from '@stryker-mutator/api/plugin';
import { Transpiler } from '@stryker-mutator/api/transpile';
import { errorToString } from '@stryker-mutator/util';
import { Observable, range } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { from } from 'rxjs';
import { flatMap, zip } from 'rxjs/operators';

import { coreTokens } from '../di';
import SourceFile from '../SourceFile';
import TestableMutant from '../TestableMutant';
import TranspiledMutant from '../TranspiledMutant';

import TranspileResult from './TranspileResult';

const INITIAL_CONCURRENCY = 100;

export class MutantTranspileScheduler implements Disposable {
  private currentMutatedFile: SourceFile;
  private readonly concurrencyTicket$ = new BehaviorSubject<number>(INITIAL_CONCURRENCY);

  public static inject = tokens(coreTokens.transpiler, coreTokens.transpiledFiles);

  /**
   * Creates a mutant transpiler
   */
  constructor(private readonly transpiler: Transpiler, private readonly unMutatedFiles: readonly File[]) {}

  public scheduleTranspileMutants(allMutants: readonly TestableMutant[]): Observable<TranspiledMutant> {
    return from(allMutants).pipe(
      zip(this.concurrencyTicket$.pipe(flatMap(n => range(0, n)))),
      flatMap(([mutant]) => this.transpileMutant(mutant), 1 /* IMPORTANT! Never transpile multiple mutants at once! */)
    );
  }

  /**
   * Schedule next mutant to be transpiled
   */
  public readonly scheduleNext = () => {
    this.concurrencyTicket$.next(1);
  };

  /**
   * Dispose
   */
  public dispose() {
    this.concurrencyTicket$.complete();
  }

  private createTranspiledMutant(mutant: TestableMutant, transpileResult: TranspileResult) {
    return new TranspiledMutant(mutant, transpileResult, someFilesChanged(this.unMutatedFiles));

    function someFilesChanged(unMutatedFiles: readonly File[]): boolean {
      return transpileResult.outputFiles.some(file => fileChanged(file, unMutatedFiles));
    }

    function fileChanged(file: File, unMutatedFiles: readonly File[]) {
      if (unMutatedFiles) {
        const unMutatedFile = unMutatedFiles.find(f => f.name === file.name);
        return !unMutatedFile || unMutatedFile.textContent !== file.textContent;
      } else {
        return true;
      }
    }
  }

  private async transpileMutant(mutant: TestableMutant): Promise<TranspiledMutant> {
    const filesToTranspile: File[] = [];
    if (this.currentMutatedFile && this.currentMutatedFile.name !== mutant.fileName) {
      filesToTranspile.push(this.currentMutatedFile.file);
    }
    this.currentMutatedFile = mutant.sourceFile;
    const mutatedFile = new File(mutant.fileName, Buffer.from(mutant.mutatedCode));
    filesToTranspile.push(mutatedFile);
    try {
      const transpiledFiles = await this.transpiler.transpile(filesToTranspile);
      return this.createTranspiledMutant(mutant, { outputFiles: transpiledFiles, error: null });
    } catch (error) {
      return this.createTranspiledMutant(mutant, { outputFiles: [], error: errorToString(error) });
    }
  }
}
