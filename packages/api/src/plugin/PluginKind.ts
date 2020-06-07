/**
 * The plugin kinds supported by Stryker
 */
export enum PluginKind {
  /**
   * @deprecated, please use `OptionsEditor`
   */
  ConfigEditor = 'ConfigEditor',
  OptionsEditor = 'OptionsEditor',
  TestRunner = 'TestRunner',
  TestFramework = 'TestFramework',
  Transpiler = 'Transpiler',
  Mutator = 'Mutator',
  Reporter = 'Reporter'
}
