

interface TestRunnerConfig{
  timeoutMs?: number;
  timeoutFactor?: number;
  individualTests?: boolean;
  libs?: string[];
  files?: string[];
  browserNoActivityTimeout?: number;
}
export default TestRunnerConfig;