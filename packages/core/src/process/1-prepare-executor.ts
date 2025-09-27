import {
  StrykerOptions,
  PartialStrykerOptions,
  strykerCoreSchema,
} from '@stryker-mutator/api/core';
import {
  BaseContext,
  commonTokens,
  Injector,
  tokens,
} from '@stryker-mutator/api/plugin';
import { frameworkPluginsFileUrl } from '@stryker-mutator/instrumenter';
import { deepFreeze } from '@stryker-mutator/util';
import { execaCommand } from 'execa';

import { ConfigReader } from '../config/config-reader.js';
import { coreTokens, PluginCreator } from '../di/index.js';
import { TemporaryDirectory } from '../utils/temporary-directory.js';
import { ConfigError } from '../errors.js';
import { PluginLoader } from '../di/plugin-loader.js';
import { reporterPluginsFileUrl } from '../reporters/index.js';
import { Timer } from '../utils/timer.js';
import { MetaSchemaBuilder, OptionsValidator } from '../config/index.js';
import { BroadcastReporter } from '../reporters/broadcast-reporter.js';
import { UnexpectedExitHandler } from '../unexpected-exit-handler.js';

import { FileSystem, ProjectReader } from '../fs/index.js';

import { MutantInstrumenterContext } from './index.js';
import { Reporter } from '@stryker-mutator/api/report';
import { LoggingBackend, LoggingServerAddress } from '../logging/index.js';

export interface PrepareExecutorContext extends BaseContext {
  [coreTokens.loggingServerAddress]: LoggingServerAddress;
  [coreTokens.reporterOverride]?: Reporter;
}

export interface PrepareExecutorArgs {
  cliOptions: PartialStrykerOptions;
  targetMutatePatterns: string[] | undefined;
}

export class PrepareExecutor {
  public static readonly inject = tokens(
    commonTokens.injector,
    coreTokens.loggingSink,
  );
  constructor(
    private readonly injector: Injector<PrepareExecutorContext>,
    private readonly loggingBackend: LoggingBackend,
  ) {}

  public async execute({
    cliOptions,
    targetMutatePatterns,
  }: PrepareExecutorArgs): Promise<Injector<MutantInstrumenterContext>> {
    // greedy initialize, so the time starts immediately
    const timer = new Timer();

    // Already configure the logger, so next classes can use them
    this.loggingBackend.configure(cliOptions);

    // Read the config file
    const configReaderInjector = this.injector
      .provideValue(coreTokens.validationSchema, strykerCoreSchema)
      .provideClass(coreTokens.optionsValidator, OptionsValidator);
    const configReader = configReaderInjector.injectClass(ConfigReader);
    const options: StrykerOptions = await configReader.readConfig(cliOptions);

    // Load plugins
    const pluginLoader = configReaderInjector.injectClass(PluginLoader);
    const pluginDescriptors = [
      ...options.plugins,
      frameworkPluginsFileUrl,
      reporterPluginsFileUrl,
      ...options.appendPlugins,
    ];
    const loadedPlugins = await pluginLoader.load(pluginDescriptors);

    // Revalidate the options with plugin schema additions
    const metaSchemaBuilder =
      configReaderInjector.injectClass(MetaSchemaBuilder);
    const metaSchema = metaSchemaBuilder.buildMetaSchema(
      loadedPlugins.schemaContributions,
    );
    const optionsValidatorInjector = configReaderInjector.provideValue(
      coreTokens.validationSchema,
      metaSchema,
    );
    const validator: OptionsValidator =
      optionsValidatorInjector.injectClass(OptionsValidator);
    validator.validate(options, true);

    // Done reading config, deep freeze it so it won't change unexpectedly
    deepFreeze(options);

    // Final logging configuration, update the logging configuration with the latest results
    this.loggingBackend.configure(options);

    // Resolve input files
    const projectFileReaderInjector = optionsValidatorInjector
      .provideValue(commonTokens.options, options)
      .provideClass(coreTokens.temporaryDirectory, TemporaryDirectory)
      .provideClass(coreTokens.fs, FileSystem)
      .provideValue(coreTokens.pluginsByKind, loadedPlugins.pluginsByKind);
    const project = await projectFileReaderInjector
      .injectClass(ProjectReader)
      .read(targetMutatePatterns);

    if (project.isEmpty) {
      throw new ConfigError('No input files found.');
    } else {
      // Done preparing, finish up and return
      await projectFileReaderInjector
        .resolve(coreTokens.temporaryDirectory)
        .initialize();
      return projectFileReaderInjector
        .provideValue(coreTokens.project, project)
        .provideValue(commonTokens.fileDescriptions, project.fileDescriptions)
        .provideClass(coreTokens.pluginCreator, PluginCreator)
        .provideClass(coreTokens.reporter, BroadcastReporter)
        .provideValue(coreTokens.timer, timer)
        .provideValue(coreTokens.project, project)
        .provideValue(coreTokens.execa, execaCommand)
        .provideValue(coreTokens.process, process)
        .provideClass(coreTokens.unexpectedExitRegistry, UnexpectedExitHandler)
        .provideValue(
          coreTokens.pluginModulePaths,
          loadedPlugins.pluginModulePaths,
        );
    }
  }
}
