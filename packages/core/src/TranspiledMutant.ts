import TestableMutant from './TestableMutant';
import TranspileResult from './transpiler/TranspileResult';

export default class TranspiledMutant {
  /**
   * Creates a transpiled mutant
   * @param mutant The mutant which is just transpiled
   * @param transpileResult The transpile result of the mutant
   * @param changedAnyTranspiledFiles Indicated whether or not this mutant changed the transpiled output files. This is not always the case, for example: mutating a TS interface
   */
  constructor(public mutant: TestableMutant, public transpileResult: TranspileResult, public changedAnyTranspiledFiles: boolean) {}
}
