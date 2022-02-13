import { StrykerOptions, PartialStrykerOptions, strykerCoreSchema } from '@stryker-mutator/api/core';
import { BaseContext, commonTokens, Injector, tokens } from '@stryker-mutator/api/plugin';

import { deepFreeze } from '@stryker-mutator/util';

import { execaCommand } from 'execa';

import { ConfigReader } from '../config/config-reader.js';
import { LogConfigurator } from '../logging/index.js';
import { coreTokens, PluginCreator } from '../di/index.js';
import { TemporaryDirectory } from '../utils/temporary-directory.js';
import { InputFileResolver } from '../input/index.js';
import { ConfigError } from '../errors.js';
import { PluginLoader } from '../di/plugin-loader.js';
import { reporterPluginsFileUrl } from '../reporters/index.js';
import { Timer } from '../utils/timer.js';
import { MetaSchemaBuilder, OptionsValidator } from '../config/index.js';
import { BroadcastReporter } from '../reporters/broadcast-reporter.js';
import { UnexpectedExitHandler } from '../unexpected-exit-handler.js';

import { MutantInstrumenterContext } from './index.js';

export class PrepareExecutor {
  public static readonly inject = tokens(commonTokens.injector);
  constructor(private readonly injector: Injector<BaseContext>) {}

  public async execute(cliOptions: PartialStrykerOptions): Promise<Injector<MutantInstrumenterContext>> {
    // greedy initialize, so the time starts immediately
    const timer = new Timer();

    // Already configure the logger, so next classes can use
    LogConfigurator.configureMainProcess(cliOptions.logLevel, cliOptions.fileLogLevel, cliOptions.allowConsoleColors);

    // Read the config file
    const configReaderInjector = this.injector
      .provideValue(coreTokens.validationSchema, strykerCoreSchema)
      .provideClass(coreTokens.optionsValidator, OptionsValidator);
    const configReader = configReaderInjector.injectClass(ConfigReader);
    const options: StrykerOptions = await configReader.readConfig(cliOptions);

    // Load plugins
    const pluginLoader = configReaderInjector.injectClass(PluginLoader);
    const pluginDescriptors = [...options.plugins, reporterPluginsFileUrl, ...options.appendPlugins];
    const loadedPlugins = await pluginLoader.load(pluginDescriptors);

    // Revalidate the options with plugin schema additions
    const metaSchemaBuilder = configReaderInjector.injectClass(MetaSchemaBuilder);
    const metaSchema = metaSchemaBuilder.buildMetaSchema(loadedPlugins.schemaContributions);
    const optionsValidatorInjector = configReaderInjector.provideValue(coreTokens.validationSchema, metaSchema);
    const validator: OptionsValidator = optionsValidatorInjector.injectClass(OptionsValidator);
    validator.validate(options, true);

    // Done reading config, deep freeze it so it won't change unexpectedly
    deepFreeze(options);

    // Final logging configuration, open the logging server
    const loggingContext = await LogConfigurator.configureLoggingServer(options.logLevel, options.fileLogLevel, options.allowConsoleColors);

    // Resolve input files
    const inputFileResolverInjector = optionsValidatorInjector
      .provideValue(commonTokens.options, options)
      .provideClass(coreTokens.temporaryDirectory, TemporaryDirectory)
      .provideValue(coreTokens.pluginsByKind, loadedPlugins.pluginsByKind)
      .provideClass(coreTokens.pluginCreator, PluginCreator)
      .provideClass(coreTokens.reporter, BroadcastReporter);
    const inputFiles = await inputFileResolverInjector.injectClass(InputFileResolver).resolve();

    if (inputFiles.files.length) {
      // Done preparing, finish up and return
      await inputFileResolverInjector.resolve(coreTokens.temporaryDirectory).initialize();
      return inputFileResolverInjector
        .provideValue(coreTokens.timer, timer)
        .provideValue(coreTokens.inputFiles, inputFiles)
        .provideValue(coreTokens.loggingContext, loggingContext)
        .provideValue(coreTokens.execa, execaCommand)
        .provideValue(coreTokens.process, process)
        .provideClass(coreTokens.unexpectedExitRegistry, UnexpectedExitHandler)
        .provideValue(coreTokens.pluginModulePaths, loadedPlugins.pluginModulePaths);
    } else {
      throw new ConfigError('No input files found.');
    }
  }
}
