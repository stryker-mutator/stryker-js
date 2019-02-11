import { Observable, range } from 'rxjs';
import TestableMutant from '../TestableMutant';
import { File } from 'stryker-api/core';
import SourceFile from '../SourceFile';
import { Transpiler } from 'stryker-api/transpile';
import { Disposable } from 'stryker-api/plugin';
import TranspiledMutant from '../TranspiledMutant';
import TranspileResult from './TranspileResult';
import { errorToString } from '@stryker-mutator/util';
import { tokens } from 'stryker-api/plugin';
import { coreTokens } from '../di';
import { from } from 'rxjs';
import { flatMap, zip } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

const INITIAL_CONCURRENCY = 100;

export class MutantTranspileScheduler {

  private currentMutatedFile: SourceFile;
  private readonly concurrencyTicket$ = new BehaviorSubject<number>(INITIAL_CONCURRENCY);

  public static inject = tokens(coreTokens.transpiler, coreTokens.transpiledFiles);

  /**
   * Creates a mutant transpiler
   */
  constructor(private readonly transpiler: Transpiler & Disposable, private readonly unMutatedFiles: ReadonlyArray<File>) { }

  public scheduleTranspileMutants(allMutants: ReadonlyArray<TestableMutant>): Observable<TranspiledMutant> {
    return from(allMutants).pipe(
      zip(this.concurrencyTicket$.pipe(
        flatMap(n => range(0, n))
      )),
      flatMap(([mutant]) => this.transpileMutant(mutant), 1 /* IMPORTANT! Never transpile multiple mutants at once! */)
    );
  }

  /**
   * Schedule next mutant to be transpiled
   */
  public readonly scheduleNext = () => {
    this.concurrencyTicket$.next(1);
  }

  /**
   * Dispose all
   */
  public dispose() {
    this.concurrencyTicket$.complete();
    // TODO: Let typed-inject dispose this one
    this.transpiler.dispose();
  }

  private createTranspiledMutant(mutant: TestableMutant, transpileResult: TranspileResult) {
    return new TranspiledMutant(mutant, transpileResult, someFilesChanged(this.unMutatedFiles));

    function someFilesChanged(unMutatedFiles: ReadonlyArray<File>): boolean {
      return transpileResult.outputFiles.some(file => fileChanged(file, unMutatedFiles));
    }

    function fileChanged(file: File, unMutatedFiles: ReadonlyArray<File>) {
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
