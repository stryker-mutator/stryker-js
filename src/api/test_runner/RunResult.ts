import {CoverageCollection} from './Coverage';
import TestResult from './TestResult';

interface RunResult {
  result: TestResult;
  specNames?: string[];
  succeeded?: number;
  failed?: number;
  timeSpent?: number;
  coverage?: CoverageCollection;
}

export default RunResult;