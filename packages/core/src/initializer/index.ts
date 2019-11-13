import { commonTokens } from '@stryker-mutator/api/plugin';
import { getLogger } from 'log4js';
import { rootInjector } from 'typed-inject';
import { RestClient } from 'typed-rest-client';

import { loggerFactory } from '../di/factoryMethods';

import * as initializerTokens from './initializerTokens';
import NpmClient from './NpmClient';
import StrykerConfigWriter from './StrykerConfigWriter';
import StrykerInitializer from './StrykerInitializer';
import { StrykerInquirer } from './StrykerInquirer';
import strykerPresets from './StrykerPresets';

const BASE_NPM_SEARCH = 'https://api.npms.io';
const BASE_NPM_PACKAGE = 'https://www.unpkg.com';

export function initializerFactory(): StrykerInitializer {
  return rootInjector
    .provideValue(commonTokens.getLogger, getLogger)
    .provideFactory(commonTokens.logger, loggerFactory)
    .provideValue(initializerTokens.out, console.log)
    .provideValue(initializerTokens.strykerPresets, strykerPresets)
    .provideValue(initializerTokens.restClientNpmSearch, new RestClient('npmSearch', BASE_NPM_SEARCH))
    .provideValue(initializerTokens.restClientNpm, new RestClient('npm', BASE_NPM_PACKAGE))
    .provideClass(initializerTokens.npmClient, NpmClient)
    .provideClass(initializerTokens.configWriter, StrykerConfigWriter)
    .provideClass(initializerTokens.inquirer, StrykerInquirer)
    .injectClass(StrykerInitializer);
}

export { initializerTokens };
