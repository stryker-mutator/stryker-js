import { StrykerOptions } from '../../core';

/**
 * Represents an options object to configure a TestRunner.
 */
interface RunnerOptions {

  /**
   * The names of the files loaded in the sandbox.
   */
  fileNames: string[];

  /**
   * Represents a free port which the test runner can choose to use
   */
  port: number;

  /**
   * Represents test runner config file
   */
  configFile?: string;

  /**
   *  custom settings for test runner go here
   */
  config?: {
    [customConfig: string]: any;
  };

  /**
   * Represents project type for test runner
   */
  projectType?: string;

  /**
   * The underlying strykerOptions
   */
  strykerOptions: StrykerOptions;
}

export default RunnerOptions;
