import * as karma from 'karma';

export const DEPRECATED_KARMA_CONFIG_FILE = 'karmaConfigFile';
export const DEPRECATED_KARMA_CONFIG = 'karmaConfig';
export const KARMA_CONFIG_KEY = 'karma';

export type ProjectKind = 'custom' | 'angular-cli';

export default interface StrykerKarmaSetup {
  project: ProjectKind;
  configFile?: string;
  config?: karma.ConfigOptions;
}