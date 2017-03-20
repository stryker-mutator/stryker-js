import {StrykerOptions} from '../../core';

/**
 * Represents an settings object for a TestFramework.
 */
interface TestFrameworkSettings {
  /**
   * The StrykerOptions.
   */
  options: StrykerOptions;
}

export default TestFrameworkSettings;