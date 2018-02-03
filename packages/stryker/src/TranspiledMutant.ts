import TestableMutant from './TestableMutant';
import { TranspileResult } from 'stryker-api/transpile';
import { File, TextFile } from 'stryker-api/core';

export default class TranspiledMutant {

  /**
   * Creates a transpiled mutant
   * @param mutant The mutant which is just transpiled
   * @param transpileResult The transpile result of the mutant
   * @param changedAnyTranspiledFiles Indicated whether or not this mutant changed the transpiled output files. This is not always the case, for example: mutating a TS interface
   */
  constructor(public mutant: TestableMutant, public transpileResult: TranspileResult, public changedAnyTranspiledFiles: boolean) { }

  static create(mutant: TestableMutant, transpileResult: TranspileResult, unMutatedFiles: File[]) {
    return new TranspiledMutant(mutant, transpileResult, someFilesChanged());

    function someFilesChanged(): boolean {
      return transpileResult.outputFiles.some(file => fileChanged(file));
    }

    function fileChanged(file: File) {
      if (unMutatedFiles) {
        const unMutatedFile = unMutatedFiles.find(f => f.name === file.name);
        return !unMutatedFile || (unMutatedFile as TextFile).content !== (file as TextFile).content;
      } else {
        return true;
      }
    }
  }
}