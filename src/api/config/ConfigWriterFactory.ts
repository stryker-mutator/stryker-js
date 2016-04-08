import {Factory} from '../core';
import ConfigWriter from './ConfigWriter'

namespace ConfigWriterFactory {

  /**
   * Represents a Factory for ConfigWriters.
   */
  class ConfigWriterFactory extends Factory<any, ConfigWriter> {

    constructor() {
      super('config-reader');
    }
  }

  let configWriterFactory = new ConfigWriterFactory();

  /**
   * Returns the current instance of the ConfigWriterFactory.
   */
  export function instance() {
    return <Factory<any, ConfigWriter>>configWriterFactory;
  }
}

export default ConfigWriterFactory;