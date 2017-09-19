import TestableMutant from './TestableMutant';
import { TranspileResult } from 'stryker-api/transpile';

export default class TranspiledMutant {
  constructor(public mutant: TestableMutant, public transpileResult: TranspileResult) { }
}