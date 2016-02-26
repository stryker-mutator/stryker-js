import {CoverageResult} from './CoverageResult';
import Result from './Result';

interface TestRunResult {
  id: number;
  name: string;
  result: Result;
  timeSpent?: number;
  coverage: CoverageResult;
}

export default TestRunResult;