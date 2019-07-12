import jest from 'jest';

/**
 * The Configloader interface is used to load different kinds of configurations for Jest.
 * Custom ConfigLoaders should implement this interface, the ConfigEditor will then be able to use it to load a Jest configuration.
 *
 * ConfigLoaders are typically used for projects that do not provide their configuration via the package.json file (e.g. React).
 * The loaderConfig method will return a usable config for Jest to use.
 */

export default interface JestConfigLoader {
  /*
   * Load the JSON representation of a Jest Configuration.
   *
   * @return {JestConfiguration} an object containing the Jest configuration.
   */
  loadConfig(): jest.Configuration;
}
