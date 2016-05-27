import {StrykerOptions, InputFile} from '../core';

/**
 * Represents an options object to configure a TestRunner.
 */
interface RunnerOptions{
  /**
   * A collection of paths to the files
   */
  files: InputFile[];
  
  /**
   * Represents a free port which the test runner can choose to use
   */
  port?: number;
   
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