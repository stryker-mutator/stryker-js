export const mochaOptionsKeyDeprecated = 'mochaOptions';
export const mochaOptionsKey = 'testRunner.settings.config';

export default interface MochaRunnerOptions {
  require?: string[];
  // deprecated
  opts?: string;
  timeout?: number;
  asyncOnly?: boolean;
  ui?: string;
  files?: string[] | string;
}
