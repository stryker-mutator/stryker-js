import ConfigReader from './ConfigReader';
import { tokens } from '@stryker-mutator/api/plugin';
import { coreTokens } from '../di';

export function readConfig(configReader: ConfigReader) {
  return configReader.readConfig();
}

readConfig.inject = tokens(coreTokens.ConfigReader);
