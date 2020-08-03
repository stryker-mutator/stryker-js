import { PartialStrykerOptions } from '@stryker-mutator/api/core';
import { commonTokens, Injector, tokens } from '@stryker-mutator/api/plugin';

import { LogConfigurator } from '../logging';
import { buildMainInjector, coreTokens } from '../di';
import InputFileResolver from '../input/InputFileResolver';
import { ConfigError } from '../errors';

import { MutantInstrumenterContext } from '.';

export class PrepareExecutor {
  public static readonly inject = tokens(coreTokens.cliOptions, commonTokens.injector);
  constructor(
    private readonly cliOptions: PartialStrykerOptions,
    private readonly injector: Injector<{ [coreTokens.cliOptions]: PartialStrykerOptions }>
  ) {}

  public async execute(): Promise<Injector<MutantInstrumenterContext>> {
    LogConfigurator.configureMainProcess(this.cliOptions.logLevel, this.cliOptions.fileLogLevel, this.cliOptions.allowConsoleColors);
    const mainInjector = buildMainInjector(this.injector);
    mainInjector.resolve(coreTokens.timer).reset();
    const options = mainInjector.resolve(commonTokens.options);
    const loggingContext = await LogConfigurator.configureLoggingServer(options.logLevel, options.fileLogLevel, options.allowConsoleColors);
    const inputFiles = await mainInjector.injectClass(InputFileResolver).resolve();
    if (inputFiles.files.length) {
      mainInjector.resolve(coreTokens.temporaryDirectory).initialize();
      return mainInjector.provideValue(coreTokens.inputFiles, inputFiles).provideValue(coreTokens.loggingContext, loggingContext);
    } else {
      throw new ConfigError('No input files found.');
    }
  }
}
