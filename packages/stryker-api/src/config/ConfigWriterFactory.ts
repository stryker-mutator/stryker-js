import {Factory} from '../../core';
import Configurator from './ConfigWriter';

namespace ConfigWriterFactory {

  /**
   * Represents a Factory for ConfigWriters.
   */
  class ConfigWriterFactory extends Factory<void, Configurator> {

    constructor() {
      super('config-reader');
    }
  }

  let configWriterFactory = new ConfigWriterFactory();

  /**
   * Returns the current instance of the ConfigWriterFactory.
   */
  export function instance() {
    return <Factory<void, Configurator>>configWriterFactory;
  }
}

export default ConfigWriterFactory;