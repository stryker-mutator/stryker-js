import Config from './Config';

/**
 * Represents a ConfigEditor plugin
 *
 * ConfigEditors can change the content of the stryker runtime configuration
 * ConfigEditors are implemented as a chain of ConfigEditors, the result of
 * any previous ConfigEditor can be passed thru to the next. Please not that
 * editing of the configuration object is done by reference.
 *
 * @deprecated Please use `OptionsEditor` instead
 */
interface ConfigEditor {
  /**
   * Extending classes only need to implement the edit method, this method
   * receives a writable config object that can be edited in any way.
   * Please be aware that editing is done via object reference. Therefore
   * the return type is void.
   *
   * @param config: The stryker configuration object
   */
  edit(config: Config): void;
}

export default ConfigEditor;
