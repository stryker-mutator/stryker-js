import {CoverageCollection} from './CoverageResult';
import TestResult from './TestResult';

interface TestRunResult {
  specNames: string[];
  result: TestResult;
  succeeded?: number;
  failed?: number;
  timeSpent?: number;
  coverage?: CoverageCollection;
}

export default TestRunResult;