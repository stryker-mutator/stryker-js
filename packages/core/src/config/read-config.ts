import { StrykerOptions } from '@stryker-mutator/api/core';
import { tokens } from '@stryker-mutator/api/plugin';

import { coreTokens } from '../di';

import { ConfigReader } from './config-reader';

export function readConfig(configReader: ConfigReader): StrykerOptions {
  return configReader.readConfig();
}

readConfig.inject = tokens(coreTokens.configReader);
