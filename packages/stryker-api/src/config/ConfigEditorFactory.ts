import {Factory} from '../../core';
import ConfigEditor from './ConfigEditor';

namespace ConfigEditorFactory {

  /**
   * Represents a Factory for ConfigWriters.
   */
  class ConfigEditorFactory extends Factory<void, ConfigEditor> {

    constructor() {
      super('config-reader');
    }
  }

  let configEditorFactory = new ConfigEditorFactory();

  /**
   * Returns the current instance of the ConfigEditorFactory.
   */
  export function instance() {
    return <Factory<void, ConfigEditor>>configEditorFactory;
  }
}

export default ConfigEditorFactory;