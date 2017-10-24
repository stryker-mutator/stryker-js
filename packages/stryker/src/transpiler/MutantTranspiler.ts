import { Observable } from 'rxjs';
import { Config } from 'stryker-api/config';
import TranspilerFacade from './TranspilerFacade';
import TestableMutant from '../TestableMutant';
import { File, TextFile, FileKind } from 'stryker-api/core';
import SourceFile from '../SourceFile';
import { getLogger, Logger } from 'log4js';
import ChildProcessProxy, { ChildProxy } from '../child-proxy/ChildProcessProxy';
import { TranspileResult, FileLocation } from 'stryker-api/transpile';
import TranspiledMutant from '../TranspiledMutant';

export default class MutantTranspiler {

  private transpilerChildProcess: ChildProcessProxy<TranspilerFacade> | undefined;
  private proxy: ChildProxy<TranspilerFacade>;
  private currentMutatedFile: SourceFile;
  private log: Logger;

  /**
   * Creates the mutant transpiler in a child process if one is defined. 
   * Otherwise will just forward input as output in same process.
   * @param config The Stryker config
   */
  constructor(config: Config) {
    const transpilerOptions = { config, keepSourceMaps: false };
    if (config.transpilers.length) {
      this.transpilerChildProcess = ChildProcessProxy.create(
        require.resolve('./TranspilerFacade'),
        config.logLevel,
        config.plugins,
        TranspilerFacade,
        transpilerOptions
      );
      this.proxy = this.transpilerChildProcess.proxy;
    } else {
      let transpiler = new TranspilerFacade(transpilerOptions);
      this.proxy = {
        transpile(files: File[]) {
          return Promise.resolve(transpiler.transpile(files));
        },
        getMappedLocation(sourceFileLocation: FileLocation) {
          return Promise.resolve(transpiler.getMappedLocation(sourceFileLocation));
        }
      };
    }
    this.log = getLogger(MutantTranspiler.name);
  }

  initialize(files: File[]): Promise<TranspileResult> {
    return this.proxy.transpile(files);
  }

  transpileMutants(allMutants: TestableMutant[]): Observable<TranspiledMutant> {
    const mutants = allMutants.slice();
    return new Observable<TranspiledMutant>(observer => {
      const nextMutant = () => {
        const mutant = mutants.shift();
        if (mutant) {
          this.transpileMutant(mutant)
            .then(transpileResult => observer.next({ mutant, transpileResult }))
            .then(nextMutant)
            .catch(error => observer.error(error));
        } else {
          observer.complete();
        }
      };
      nextMutant();
    });
  }

  dispose() {
    if (this.transpilerChildProcess) {
      this.transpilerChildProcess.dispose();
    }
  }

  private transpileMutant(mutant: TestableMutant): Promise<TranspileResult> {
    const filesToTranspile: TextFile[] = [];
    if (this.currentMutatedFile && this.currentMutatedFile.file.name !== mutant.fileName) {
      filesToTranspile.push(this.currentMutatedFile.file);
    }
    this.currentMutatedFile = mutant.sourceFile;
    const mutatedFile: TextFile = {
      name: mutant.fileName,
      content: mutant.mutatedCode,
      kind: FileKind.Text,
      mutated: this.currentMutatedFile.file.mutated,
      transpiled: this.currentMutatedFile.file.transpiled,
      included: mutant.included
    };
    filesToTranspile.push(mutatedFile);
    return this.proxy.transpile(filesToTranspile);
  }
}