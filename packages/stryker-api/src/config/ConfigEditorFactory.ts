import {Factory} from '../../core';
import ConfigEditor from './ConfigEditor';

namespace ConfigEditorFactory {

  /**
   * Represents a Factory for ConfigEditors.
   */
  class ConfigEditorFactory extends Factory<void, ConfigEditor> {

    constructor() {
      super('config-reader');
    }
  }

  const configEditorFactory = new ConfigEditorFactory();

  /**
   * Returns the current instance of the ConfigEditorFactory.
   */
  export function instance() {
    return configEditorFactory as Factory<void, ConfigEditor>;
  }
}

export default ConfigEditorFactory;
