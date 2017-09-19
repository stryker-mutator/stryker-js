import { StrykerOptions, FileDescriptor } from '../../core';

/**
 * Represents an options object to configure a TestRunner.
 */
interface RunnerOptions {
  /**
   * The collection of files to load into the test runner in that exact order.
   */
  files: FileDescriptor[];

  /**
   * Represents a free port which the test runner can choose to use
   */
  port: number;

  /**
   * The underlying strykerOptions
   */
  strykerOptions: StrykerOptions;
}

export default RunnerOptions; 