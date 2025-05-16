import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

import {
  PartialStrykerOptions,
  StrykerOptions,
} from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { deepMerge, I } from '@stryker-mutator/util';

import { coreTokens } from '../di/index.js';
import { ConfigError } from '../errors.js';
import { fileUtils } from '../utils/file-utils.js';

import { OptionsValidator } from './options-validator.js';
import { SUPPORTED_CONFIG_FILE_NAMES } from './config-file-formats.js';

export const CONFIG_SYNTAX_HELP = `
Example of how a config file should look:
/**
  * @type {import('@stryker-mutator/api/core').StrykerOptions}
  */
export default {
  // You're options here!
}

Or using commonjs:
/**
  * @type {import('@stryker-mutator/api/core').StrykerOptions}
  */
module.exports = {
  // You're options here!
}

See https://stryker-mutator.io/docs/stryker-js/config-file for more information.`.trim();

export class ConfigReader {
  public static inject = tokens(
    commonTokens.logger,
    coreTokens.optionsValidator,
  );
  constructor(
    private readonly log: Logger,
    private readonly validator: I<OptionsValidator>,
  ) {}

  public async readConfig(
    cliOptions: PartialStrykerOptions,
  ): Promise<StrykerOptions> {
    const options = await this.loadOptionsFromConfigFile(cliOptions);

    // merge the config from config file and cliOptions (precedence)
    deepMerge(options, cliOptions);
    this.validator.validate(options);
    if (this.log.isDebugEnabled()) {
      this.log.debug(`Loaded config: ${JSON.stringify(options, null, 2)}`);
    }
    return options;
  }

  private async loadOptionsFromConfigFile(
    cliOptions: PartialStrykerOptions,
  ): Promise<PartialStrykerOptions> {
    const configFile = await this.findConfigFile(cliOptions.configFile);
    if (!configFile) {
      this.log.info(
        'No config file specified. Running with command line arguments.',
      );
      this.log.info('Use `stryker init` command to generate your config file.');
      return {};
    }
    this.log.debug(`Loading config from ${configFile}`);

    if (path.extname(configFile).toLocaleLowerCase() === '.json') {
      return this.readJsonConfig(configFile);
    } else {
      return this.importJSConfig(configFile);
    }
  }

  private async findConfigFile(
    configFileName: unknown,
  ): Promise<string | undefined> {
    if (typeof configFileName === 'string') {
      if (await fileUtils.exists(configFileName)) {
        return configFileName;
      } else {
        throw new ConfigReaderError('File does not exist!', configFileName);
      }
    }
    for (const fileName of SUPPORTED_CONFIG_FILE_NAMES) {
      if (await fileUtils.exists(fileName)) {
        return fileName;
      }
    }
    return undefined;
  }

  private async readJsonConfig(
    configFile: string,
  ): Promise<PartialStrykerOptions> {
    const fileContent = await fs.promises.readFile(configFile, 'utf-8');
    try {
      return JSON.parse(fileContent);
    } catch (err) {
      throw new ConfigReaderError(
        'File contains invalid JSON',
        configFile,
        err,
      );
    }
  }

  private async importJSConfig(
    configFile: string,
  ): Promise<PartialStrykerOptions> {
    const importedModule = await this.importJSConfigModule(configFile);

    if (this.hasDefaultExport(importedModule)) {
      const maybeOptions = importedModule.default;
      if (typeof maybeOptions !== 'object') {
        if (typeof maybeOptions === 'function') {
          this.log.fatal(
            `Invalid config file. Exporting a function is no longer supported. Please export an object with your configuration instead, or use a "stryker.conf.json" file.\n${CONFIG_SYNTAX_HELP}`,
          );
        } else {
          this.log.fatal(
            `Invalid config file. It must export an object, found a "${typeof maybeOptions}"!\n${CONFIG_SYNTAX_HELP}`,
          );
        }
        throw new ConfigReaderError(
          'Default export of config file must be an object!',
          configFile,
        );
      }
      if (!maybeOptions || !Object.keys(maybeOptions).length) {
        this.log.warn(
          `Stryker options were empty. Did you forget to export options from ${configFile}?`,
        );
      }

      return { ...maybeOptions } as PartialStrykerOptions;
    } else {
      this.log.fatal(
        `Invalid config file. It is missing a default export. ${describeNamedExports()}\n${CONFIG_SYNTAX_HELP}`,
      );
      throw new ConfigReaderError(
        'Config file must have a default export!',
        configFile,
      );

      function describeNamedExports() {
        const namedExports: string[] =
          (typeof importedModule === 'object' &&
            Object.keys(importedModule ?? {})) ||
          [];
        if (namedExports.length === 0) {
          return "In fact, it didn't export anything.";
        } else {
          return `Found named export(s): ${namedExports.map((name) => `"${name}"`).join(', ')}.`;
        }
      }
    }
  }

  private async importJSConfigModule(configFile: string): Promise<unknown> {
    try {
      return await fileUtils.importModule(
        pathToFileURL(path.resolve(configFile)).toString(),
      );
    } catch (err) {
      throw new ConfigReaderError('Error during import', configFile, err);
    }
  }

  private hasDefaultExport(
    importedModule: unknown,
  ): importedModule is { default: unknown } {
    return importedModule &&
      typeof importedModule === 'object' &&
      'default' in importedModule
      ? true
      : false;
  }
}

export class ConfigReaderError extends ConfigError {
  constructor(message: string, configFileName: string, cause?: unknown) {
    super(`Invalid config file "${configFileName}". ${message}`, cause);
  }
}
