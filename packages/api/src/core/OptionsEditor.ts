import { StrykerOptions } from '../../core';

/**
 * Represents an OptionsEditor plugin
 *
 * OptionEditors can change the content of the stryker options at runtime.
 * OptionEditors are implemented as a chain of OptionEditors, the result of
 * any previous ConfigEditor can be passed thru to the next. Please not that
 * editing of the configuration object is done by reference.
 *
 */
export interface OptionsEditor {
  /**
   * Extending classes only need to implement the edit method, this method
   * receives a writable config object that can be edited in any way.
   * Please be aware that editing is done via object reference. Therefore
   * the return type is void.
   *
   * @param options: The stryker configuration object
   */
  edit(options: StrykerOptions): void;
}
