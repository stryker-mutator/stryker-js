import * as karma from 'karma';

export const DEPRECATED_KARMA_CONFIG_FILE = 'karmaConfigFile';
export const DEPRECATED_KARMA_CONFIG = 'karmaConfig';
export const KARMA_CONFIG_KEY = 'karma';

export type ProjectKind = 'custom' | 'angular-cli';

export interface NgConfigOptions {
  testArguments?: string[];
}

export default interface StrykerKarmaSetup {
  // Deprecrated
  project?: ProjectKind;
  projectType: ProjectKind;
  configFile?: string;
  config?: karma.ConfigOptions;
  ngConfig?: NgConfigOptions;
}
