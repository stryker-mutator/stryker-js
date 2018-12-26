import * as karma from 'karma';

export const DEPRECATED_KARMA_CONFIG_FILE = 'karmaConfigFile';
export const DEPRECATED_KARMA_CONFIG = 'karmaConfig';
export const KARMA_CONFIG_KEY = 'karma';

export type ProjectKind = 'custom' | 'angular-cli';

export interface NgTestArguments {
  [key: string]: string | undefined;
}

export interface NgConfigOptions {
  testArguments?: NgTestArguments;
}

export default interface StrykerKarmaSetup {
  config?: karma.ConfigOptions;
  configFile?: string;
  ngConfig?: NgConfigOptions;
  // Deprecrated
  project?: ProjectKind;
  projectType: ProjectKind;
}
