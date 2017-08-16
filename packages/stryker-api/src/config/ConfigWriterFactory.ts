import {Factory} from '../../core';
import ConfigEditor from './ConfigEditor';

namespace ConfigWriterFactory {

  /**
   * Represents a Factory for ConfigWriters.
   */
  class ConfigWriterFactory extends Factory<void, ConfigEditor> {

    constructor() {
      super('config-reader');
    }
  }

  let configWriterFactory = new ConfigWriterFactory();

  /**
   * Returns the current instance of the ConfigWriterFactory.
   */
  export function instance() {
    return <Factory<void, ConfigEditor>>configWriterFactory;
  }
}

export default ConfigWriterFactory;