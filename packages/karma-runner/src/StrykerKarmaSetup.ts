import * as karma from 'karma';

export const KARMA_CONFIG_KEY = 'karma';

export type ProjectKind = 'custom' | 'angular-cli';

export interface NgTestArguments {
  [key: string]: string | undefined;
}

export interface NgConfigOptions {
  testArguments?: NgTestArguments;
}

export default interface StrykerKarmaSetup {
  projectType: ProjectKind;
  configFile?: string;
  config?: karma.ConfigOptions;
  ngConfig?: NgConfigOptions;
}
