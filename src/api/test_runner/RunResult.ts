import {CoverageCollection} from './Coverage';
import TestResult from './TestResult';

interface RunResult {
  specNames: string[];
  result: TestResult;
  succeeded?: number;
  failed?: number;
  timeSpent?: number;
  coverage?: CoverageCollection;
}

export default RunResult;