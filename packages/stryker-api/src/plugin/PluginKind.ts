/**
 * The plugin kinds supported by Stryker
 */
export enum PluginKind {
  ConfigEditor = 'ConfigEditor',
  TestRunner = 'TestRunner',
  TestFramework = 'TestFramework',
  Transpiler = 'Transpiler',
  Mutator = 'Mutator',
  Reporter = 'Reporter'
}
