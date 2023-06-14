import { createInjector } from 'typed-inject';
import { RestClient } from 'typed-rest-client';
import { execaCommand } from 'execa';
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

const NPM_REGISTRY = 'https://registry.npmjs.com';

export function initializerFactory(): StrykerInitializer {
  LogConfigurator.configureMainProcess(LogLevel.Information);
  return provideLogger(createInjector())
    .provideValue(initializerTokens.out, console.log)
    .provideValue(initializerTokens.restClientNpm, new RestClient('npm', NPM_REGISTRY))
    .provideClass(initializerTokens.npmClient, NpmClient)
    .provideClass(initializerTokens.configWriter, StrykerConfigWriter)
    .provideClass(initializerTokens.gitignoreWriter, GitignoreWriter)
    .provideClass(initializerTokens.inquirer, StrykerInquirer)
    .provideValue(coreTokens.execa, execaCommand)
    .provideValue(coreTokens.resolveFromCwd, resolveFromCwd)
    .provideFactory(initializerTokens.customInitializers, createInitializers)
    .injectClass(StrykerInitializer);
}

export { initializerTokens };
