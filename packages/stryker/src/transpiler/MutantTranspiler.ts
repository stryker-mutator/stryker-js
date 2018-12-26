import { Observable } from 'rxjs';
import { Config } from 'stryker-api/config';
import { File } from 'stryker-api/core';
import { TranspilerOptions } from 'stryker-api/transpile';
import ChildProcessProxy, { Promisified } from '../child-proxy/ChildProcessProxy';
import LoggingClientContext from '../logging/LoggingClientContext';
import SourceFile from '../SourceFile';
import TestableMutant from '../TestableMutant';
import TranspiledMutant from '../TranspiledMutant';
import { errorToString } from '../utils/objectUtils';
import TranspileResult from './TranspileResult';
import TranspilerFacade from './TranspilerFacade';

export default class MutantTranspiler {
  private currentMutatedFile: SourceFile;
  private readonly proxy: Promisified<TranspilerFacade>;

  private readonly transpilerChildProcess: ChildProcessProxy<TranspilerFacade> | undefined;
  private unMutatedFiles: ReadonlyArray<File>;

  /**
   * Creates the mutant transpiler in a child process if one is defined.
   * Otherwise will just forward input as output in same process.
   * @param config The Stryker config
   */
  constructor(config: Config, loggingContext: LoggingClientContext) {
    const transpilerOptions: TranspilerOptions = { config, produceSourceMaps: false };
    if (config.transpilers.length) {
      this.transpilerChildProcess = ChildProcessProxy.create(
        require.resolve('./TranspilerFacade'),
        loggingContext,
        config.plugins,
        process.cwd(),
        TranspilerFacade,
        transpilerOptions
      );
      this.proxy = this.transpilerChildProcess.proxy;
    } else {
      this.proxy = new TranspilerFacade(transpilerOptions);
    }
  }

  public dispose() {
    if (this.transpilerChildProcess) {
      this.transpilerChildProcess.dispose();
    }
  }

  public initialize(files: ReadonlyArray<File>): Promise<ReadonlyArray<File>> {
    return this.proxy.transpile(files).then((transpiledFiles: ReadonlyArray<File>) => {
      this.unMutatedFiles = transpiledFiles;

      return transpiledFiles;
    });
  }

  public transpileMutants(allMutants: TestableMutant[]): Observable<TranspiledMutant> {
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

  private createTranspiledMutant(mutant: TestableMutant, transpileResult: TranspileResult, unMutatedFiles: ReadonlyArray<File>) {
    return new TranspiledMutant(mutant, transpileResult, someFilesChanged());

    function someFilesChanged(): boolean {
      return transpileResult.outputFiles.some(fileChanged);
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
