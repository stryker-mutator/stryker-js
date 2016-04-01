import {StrykerOptions} from '../core';

/**
 * Represents an options object to configure a TestRunner.
 */
interface RunnerOptions{
  /**
   * A collection representing the source files
   */
  sourceFiles: string[];
  
  /**
   * A collection representing the additional files (test files and needed library files)
   */
  additionalFiles: string[];
  
  /**
   * Represents a free port which the test runner can choose to use
   */
  port: number;
   
  /**
   * The underlying strykerOptions
   */
  strykerOptions: StrykerOptions;
  
  /**
   * Enable code coverage. When enabled, the calling party is interested in code coverage.
   */
  coverageEnabled?: boolean
}

export default RunnerOptions; 