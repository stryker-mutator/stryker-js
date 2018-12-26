export const mochaOptionsKey = 'mochaOptions';

export default interface MochaRunnerOptions {
  asyncOnly?: boolean;
  files?: string[] | string;
  grep?: RegExp;
  opts?: string;
  require?: string[];
  timeout?: number;
  ui?: string;
}
