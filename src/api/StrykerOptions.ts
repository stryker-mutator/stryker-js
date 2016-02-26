'use strict';

interface StrykerOptions {
  // this ensures that custom config for for example 'karma' can be added under the 'karma' key
  [customConfig: string]: any;
  
  /**
   * A list of library files.
   */
  libs: string[];
  
  /**
   * Amount of additional time, in milliseconds, the mutation test is allowed to run
   */
  timeoutMs: number;
  
  /**
   * The factor is applied on top of the other timeouts when during mutation testing
   */
  timeoutFactor: number;
  
  /**
   * Runs each test separately instead of entire test files
   */
  individualTests: boolean;
}

export default StrykerOptions;