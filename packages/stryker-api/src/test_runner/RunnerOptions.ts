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
   * The underlying strykerOptions
   */
  strykerOptions: StrykerOptions;
}

export default RunnerOptions;
