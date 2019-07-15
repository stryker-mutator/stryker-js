enum Tokens {
  CliOptions = 'cliOptions',
  ConfigReader = 'configReader',
  ConfigReadFromConfigFile = 'configReadFromConfigFile',
  ConfigEditorApplier = 'configEditorApplier',
  InputFiles = 'inputFiles',
  InitialRunResult = 'initialRunResult',
  LoggingContext = 'loggingContext',
  MutantTranspileScheduler = 'mutantTranspileScheduler',
  PluginKind = 'pluginKind',
  PluginDescriptors = 'pluginDescriptors',
  PluginCreatorReporter = 'pluginCreatorReporter',
  PluginCreatorConfigEditor = 'pluginCreatorConfigEditor',
  PluginCreatorTranspiler = 'pluginCreatorTranspiler',
  PluginCreatorTestRunner = 'pluginCreatorTestRunner',
  PluginCreatorMutator = 'pluginCreatorMutator',
  PluginCreatorTestFramework = 'pluginCreatorTestFramework',
  Reporter = 'reporter',
  SandboxIndex = 'sandboxIndex',
  SandboxPool = 'sandboxPool',
  TestFramework = 'testFramework',
  TimeOverheadMS = 'timeOverheadMS',
  Timer = 'timer',
  TranspiledFiles = 'transpiledFiles',
  Transpiler = 'transpiler'
}

export default Tokens;
