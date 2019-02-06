import { ConfigEditorApplier } from './ConfigEditorApplier';
import ConfigReader from './ConfigReader';
import { freezeRecursively } from '../utils/objectUtils';
import { tokens } from 'stryker-api/plugin';
import { coreTokens } from '../di';
import { Config } from 'stryker-api/config';

export function readConfig(configReader: ConfigReader) {
  return configReader.readConfig();
}
readConfig.inject = tokens(coreTokens.configReader);

export function configFactory(config: Config, configEditorApplier: ConfigEditorApplier) {
  configEditorApplier.edit(config);
  return freezeRecursively(config);
}
configFactory.inject = tokens(coreTokens.configReadFromConfigFile, coreTokens.configEditorApplier);
