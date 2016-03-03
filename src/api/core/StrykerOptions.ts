'use strict';

interface StrykerOptions {
  // this ensures that custom config for for example 'karma' can be added under the 'karma' key
  [customConfig: string]: any;
  
  /**
   * A list of plugins. These plugins will be imported ('required') by Stryker upon loading.
   */
  plugins?: string[];
}

export default StrykerOptions;