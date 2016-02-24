

interface TestRunnerConfig{
  timeoutMs?: number;
  timeoutFactor?: number;
  individualTests?: boolean;
  libs?: string[];
}
export default TestRunnerConfig;