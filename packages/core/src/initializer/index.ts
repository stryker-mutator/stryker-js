import { createInjector } from 'typed-inject';
import { execaCommand, execaCommandSync } from 'execa';
import { resolveFromCwd } from '@stryker-mutator/util';
import { LogLevel } from '@stryker-mutator/api/core';

import { coreTokens, provideLogger } from '../di/index.js';

import { LogConfigurator } from '../logging/index.js';

import * as initializerTokens from './initializer-tokens.js';
import { NpmClient } from './npm-client.js';
import { StrykerConfigWriter } from './stryker-config-writer.js';
import { StrykerInitializer } from './stryker-initializer.js';
import { StrykerInquirer } from './stryker-inquirer.js';
import { createInitializers } from './custom-initializers/index.js';
import { GitignoreWriter } from './gitignore-writer.js';
import { createNpmRegistryClient, getRegistry } from './npm-registry.js';

export function initializerFactory(): StrykerInitializer {
  LogConfigurator.configureMainProcess(LogLevel.Information);
  return provideLogger(createInjector())
    .provideValue(initializerTokens.out, console.log)
    .provideValue(coreTokens.execa, execaCommand)
    .provideValue(coreTokens.execaSync, execaCommandSync)
    .provideValue(coreTokens.resolveFromCwd, resolveFromCwd)
    .provideFactory(initializerTokens.npmRegistry, getRegistry)
    .provideFactory(initializerTokens.restClientNpm, createNpmRegistryClient)
    .provideClass(initializerTokens.npmClient, NpmClient)
    .provideClass(initializerTokens.configWriter, StrykerConfigWriter)
    .provideClass(initializerTokens.gitignoreWriter, GitignoreWriter)
    .provideClass(initializerTokens.inquirer, StrykerInquirer)
    .provideFactory(initializerTokens.customInitializers, createInitializers)
    .injectClass(StrykerInitializer);
}

export { initializerTokens };
