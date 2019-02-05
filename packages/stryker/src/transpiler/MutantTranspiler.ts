import { Observable } from 'rxjs';
import TestableMutant from '../TestableMutant';
import { File, StrykerOptions } from 'stryker-api/core';
import SourceFile from '../SourceFile';
import ChildProcessProxy from '../child-proxy/ChildProcessProxy';
import { Transpiler } from 'stryker-api/transpile';
import TranspiledMutant from '../TranspiledMutant';
import TranspileResult from './TranspileResult';
import LoggingClientContext from '../logging/LoggingClientContext';
import { errorToString } from '@stryker-mutator/util';
import { ChildProcessTranspilerWorker } from './ChildProcessTranspilerWorker';
import { tokens, commonTokens } from 'stryker-api/plugin';
import { coreTokens } from '../di';

export default class MutantTranspiler {

  private readonly transpilerChildProcess: ChildProcessProxy<ChildProcessTranspilerWorker> | undefined;
  private readonly proxy: Transpiler;
  private currentMutatedFile: SourceFile;
  private unMutatedFiles: ReadonlyArray<File>;

  public static inject = tokens(commonTokens.options, coreTokens.loggingContext);

  /**
   * Creates the mutant transpiler in a child process if one is defined.
   * Otherwise will just forward input as output in same process.
   * @param config The Stryker config
   */
  constructor(options: StrykerOptions, loggingContext: LoggingClientContext) {
    if (options.transpilers.length) {
      this.transpilerChildProcess = ChildProcessProxy.create(
        require.resolve(`./${ChildProcessTranspilerWorker.name}`),
        loggingContext,
        options,
        { [commonTokens.produceSourceMaps]: false },
        process.cwd(),
        ChildProcessTranspilerWorker
      );
      this.proxy = this.transpilerChildProcess.proxy;
    } else {
      this.proxy = {
        transpile(input) {
          return Promise.resolve(input);
        }
      };
    }
  }

  public initialize(files: ReadonlyArray<File>): Promise<ReadonlyArray<File>> {
    return this.proxy.transpile(files).then((transpiledFiles: ReadonlyArray<File>) => {
      this.unMutatedFiles = transpiledFiles;
      return transpiledFiles;
    });
  }

  public transpileMutants(allMutants: ReadonlyArray<TestableMutant>): Observable<TranspiledMutant> {
    const mutants = allMutants.slice();
    return new Observable<TranspiledMutant>(observer => {
      const nextMutant = () => {
        const mutant = mutants.shift();
        if (mutant) {
          this.transpileMutant(mutant)
            .then(transpiledFiles => observer.next(this.createTranspiledMutant(mutant, transpiledFiles, this.unMutatedFiles)))
            .then(nextMutant)
            .catch(error => observer.error(error));
        } else {
          observer.complete();
        }
      };
      nextMutant();
    });
  }

  public dispose() {
    if (this.transpilerChildProcess) {
      this.transpilerChildProcess.dispose();
    }
  }

  private createTranspiledMutant(mutant: TestableMutant, transpileResult: TranspileResult, unMutatedFiles: ReadonlyArray<File>) {
    return new TranspiledMutant(mutant, transpileResult, someFilesChanged());

    function someFilesChanged(): boolean {
      return transpileResult.outputFiles.some(file => fileChanged(file));
    }

    function fileChanged(file: File) {
      if (unMutatedFiles) {
        const unMutatedFile = unMutatedFiles.find(f => f.name === file.name);
        return !unMutatedFile || unMutatedFile.textContent !== file.textContent;
      } else {
        return true;
      }
    }
  }

  private transpileMutant(mutant: TestableMutant): Promise<TranspileResult> {
    const filesToTranspile: File[] = [];
    if (this.currentMutatedFile && this.currentMutatedFile.name !== mutant.fileName) {
      filesToTranspile.push(this.currentMutatedFile.file);
    }
    this.currentMutatedFile = mutant.sourceFile;
    const mutatedFile = new File(mutant.fileName, Buffer.from(mutant.mutatedCode));
    filesToTranspile.push(mutatedFile);
    return this.proxy.transpile(filesToTranspile)
      .then((transpiledFiles: ReadonlyArray<File>) => ({ outputFiles: transpiledFiles, error: null }))
      .catch(error => ({ outputFiles: [], error: errorToString(error) }));
  }
}
