import initializerTokens from './initializerTokens';
import StrykerInitializer from './StrykerInitializer';
import { rootInjector } from 'typed-inject';
import { RestClient } from 'typed-rest-client';
import NpmClient from './NpmClient';
import { COMMON_TOKENS } from '@stryker-mutator/api/plugin';
import { loggerFactory } from '../di/factoryMethods';
import { getLogger } from 'log4js';
import strykerPresets from './StrykerPresets';
import StrykerConfigWriter from './StrykerConfigWriter';
import { StrykerInquirer } from './StrykerInquirer';

const baseNpmSearch = 'https://api.npms.io';
const baseNpmPackage = 'https://www.unpkg.com';

export function initializerFactory(): StrykerInitializer {
  return rootInjector
    .provideValue(COMMON_TOKENS.getLogger, getLogger)
    .provideFactory(COMMON_TOKENS.logger, loggerFactory)
    .provideValue(initializerTokens.Out, console.log)
    .provideValue(initializerTokens.StrykerPresets, strykerPresets)
    .provideValue(initializerTokens.RestClientNpmSearch, new RestClient('npmSearch', baseNpmSearch))
    .provideValue(initializerTokens.RestClientNpm, new RestClient('npm', baseNpmPackage))
    .provideClass(initializerTokens.NpmClient, NpmClient)
    .provideClass(initializerTokens.ConfigWriter, StrykerConfigWriter)
    .provideClass(initializerTokens.Inquirer, StrykerInquirer)
    .injectClass(StrykerInitializer);
}

export {
  initializerTokens
};
