'use strict';

interface StrykerOptions {
  // this ensures that custom config for for example 'karma' can be added under the 'karma' key
  [customConfig: string]: any;

  /**
   * The name of the test framework to use
   */
  testFrameork?: string;

  /**
   * The name of the test runner to use
   */
  testRunner?: string;
  
  /**
   * A list of plugins. These plugins will be imported ('required') by Stryker upon loading.
   */
  plugins?: string[];
  
  /**
   * The starting port to used for test frameworks that need to run a server (for example karma). 
   * If more test runners will run simultaniously, subsequent port numbers will be used (n+1, n+2, etc.)
   */
  port?: number;
}

export default StrykerOptions;