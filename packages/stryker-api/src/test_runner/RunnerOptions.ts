import { TestRunnerSettings } from '../../core';

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
   * Represents test runner settings
   */
  settings: TestRunnerSettings;
}

export default RunnerOptions;
