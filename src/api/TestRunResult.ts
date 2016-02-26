import CoverageResult from './CoverageResult';

interface TestRunResult {
  specNames: string[];
  succeeded?: number;
  failed?: number;
  timedOut?: number;
  errorOccurred?: number;
  timeSpent?: number;
  coverage?: CoverageResult;
}

export default TestRunResult;