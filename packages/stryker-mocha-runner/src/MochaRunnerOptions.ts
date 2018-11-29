export const mochaOptionsKey_deprecated = 'mochaOptions';
export const mochaOptionsKey = 'testRunner.settings.config';

export default interface MochaRunnerOptions {
  require?: string[];
  opts?: string;
  timeout?: number;
  asyncOnly?: boolean;
  ui?: string;
  files?: string[] | string;
}
