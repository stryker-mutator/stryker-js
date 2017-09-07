import { Observable } from 'rx';
import { Config } from 'stryker-api/config';
import TranspilerFacade from './TranspilerFacade';
import TestableMutant from '../TestableMutant';
import { File, TextFile, FileKind } from 'stryker-api/core';
import SourceFile from '../SourceFile';
import { getLogger, Logger } from 'log4js';
import ChildProcessProxy from '../child-proxy/ChildProcessProxy';
import { TranspileResult } from 'stryker-api/transpile';
import TranspiledMutant from '../TranspiledMutant';

export default class MutantTranspiler {

  private transpilerProxy: ChildProcessProxy<TranspilerFacade>;
  private currentMutatedFile: SourceFile;
  private log: Logger;

  constructor(config: Config) {
    this.transpilerProxy = ChildProcessProxy.create(
      require.resolve(`./${TranspilerFacade.name}`),
      config.logLevel,
      config.plugins,
      TranspilerFacade,
      { config, keepSourceMaps: false }
    );
    this.log = getLogger(MutantTranspiler.name);
  }

  initialize(files: File[]): Promise<TranspileResult> {
    return this.transpilerProxy.proxy.transpile(files);
  }

  transpileMutants(allMutants: TestableMutant[]): Observable<TranspiledMutant> {
    const mutants = allMutants.slice();
    return Observable.create<TranspiledMutant>(observer => {
      const nextMutant = () => {
        const mutant = mutants.shift();
        if (mutant) {
          this.transpileMutant(mutant)
            .then(transpileResult => observer.onNext({ mutant, transpileResult }))
            .then(nextMutant)
            .catch(error => observer.onError(error));
        } else {
          observer.onCompleted();
        }
      };
      nextMutant();
    });
  }

  dispose() {
    this.transpilerProxy.dispose();
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
    return this.transpilerProxy.proxy.transpile(filesToTranspile);
  }
}