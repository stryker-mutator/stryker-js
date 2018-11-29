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
  configFile?: string | null;

  /**
   *  custom settings for test runner go here
   */
  config?: {
    [customConfig: string]: any;
  };

  /**
   * The underlying strykerOptions
   */
  strykerOptions: StrykerOptions;
}

export default RunnerOptions;
