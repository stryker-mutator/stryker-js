import { createInjector } from 'typed-inject';
import { RestClient } from 'typed-rest-client';

import { provideLogger } from '../di';

import * as initializerTokens from './initializerTokens';
import NpmClient from './NpmClient';
import StrykerConfigWriter from './StrykerConfigWriter';
import StrykerInitializer from './StrykerInitializer';
import { StrykerInquirer } from './StrykerInquirer';
import strykerPresets from './StrykerPresets';
import GitignoreWriter from './GitignoreWriter';

const BASE_NPM_SEARCH = 'https://api.npms.io';
const BASE_NPM_PACKAGE = 'https://www.unpkg.com';

export function initializerFactory(): StrykerInitializer {
  return provideLogger(createInjector())
    .provideValue(initializerTokens.out, console.log)
    .provideValue(initializerTokens.strykerPresets, strykerPresets)
    .provideValue(initializerTokens.restClientNpmSearch, new RestClient('npmSearch', BASE_NPM_SEARCH))
    .provideValue(initializerTokens.restClientNpm, new RestClient('npm', BASE_NPM_PACKAGE))
    .provideClass(initializerTokens.npmClient, NpmClient)
    .provideClass(initializerTokens.configWriter, StrykerConfigWriter)
    .provideClass(initializerTokens.gitignoreWriter, GitignoreWriter)
    .provideClass(initializerTokens.inquirer, StrykerInquirer)
    .injectClass(StrykerInitializer);
}

export { initializerTokens };
