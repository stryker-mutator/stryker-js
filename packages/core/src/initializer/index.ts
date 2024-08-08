import { createInjector } from 'typed-inject';
import { RestClient } from 'typed-rest-client';
import { execaCommand, execaSync } from 'execa';
import { resolveFromCwd } from '@stryker-mutator/util';
import { LogLevel } from '@stryker-mutator/api/core';

import { coreTokens, provideLogger } from '../di/index.js';

import { LogConfigurator } from '../logging/log-configurator.js';

import * as initializerTokens from './initializer-tokens.js';
import { NpmClient } from './npm-client.js';
import { StrykerConfigWriter } from './stryker-config-writer.js';
import { StrykerInitializer } from './stryker-initializer.js';
import { StrykerInquirer } from './stryker-inquirer.js';
import { createInitializers } from './custom-initializers/index.js';
import { GitignoreWriter } from './gitignore-writer.js';

let currentRegistry: string | undefined;

function getRegistry(): string {
  if (!currentRegistry) {
    if (process.env.npm_config_registry) {
      currentRegistry = process.env.npm_config_registry;
    } else if (process.env.npm_command) {
      // if running inside npm and not having the registry than it's the default one
      currentRegistry = 'https://registry.npmjs.com';
    } else {
      // Using global as when trying to get the registry inside npm workspace it would fail
      const registry = execaSync('npm', ['config', 'get', '--global', 'registry'], {
        stdout: 'pipe',
        timeout: 20000,
      });

      currentRegistry = registry.stdout;
    }
  }

  return currentRegistry;
}

export function initializerFactory(): StrykerInitializer {
  LogConfigurator.configureMainProcess(LogLevel.Information);
  return provideLogger(createInjector())
    .provideValue(initializerTokens.out, console.log)
    .provideValue(initializerTokens.restClientNpm, new RestClient('npm', getRegistry()))
    .provideClass(initializerTokens.npmClient, NpmClient)
    .provideClass(initializerTokens.configWriter, StrykerConfigWriter)
    .provideClass(initializerTokens.gitignoreWriter, GitignoreWriter)
    .provideClass(initializerTokens.inquirer, StrykerInquirer)
    .provideValue(coreTokens.execa, execaCommand)
    .provideValue(coreTokens.resolveFromCwd, resolveFromCwd)
    .provideFactory(initializerTokens.customInitializers, createInitializers)
    .injectClass(StrykerInitializer);
}

export { initializerTokens, getRegistry };
