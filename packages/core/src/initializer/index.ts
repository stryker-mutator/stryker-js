import * as initializerTokens from './initializerTokens';
import StrykerInitializer from './StrykerInitializer';
import { rootInjector } from 'typed-inject';
import { RestClient } from 'typed-rest-client';
import NpmClient from './NpmClient';
import { commonTokens } from '@stryker-mutator/api/plugin';
import { loggerFactory } from '../di/factoryMethods';
import { getLogger } from 'log4js';
import strykerPresets from './StrykerPresets';
import StrykerConfigWriter from './StrykerConfigWriter';
import { StrykerInquirer } from './StrykerInquirer';

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

export {
  initializerTokens
};
