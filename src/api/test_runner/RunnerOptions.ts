
interface RunnerOptions{
  /**
   * Represents a free port which the test runner can choose to use
   */
  port: number;
  
  /**
   * Represents a temp folder which the test runner can choose to use
   */
  tempFolder: string;
  
  /**
   * Enable code coverage. When enabled, the calling party is interested in code coverage.
   */
  coverageEnabled?: boolean
}

export default RunnerOptions; 