export const mochaOptionsKey = 'mochaOptions';

export default interface MochaRunnerOptions {
  require?: string[];
  opts?: string;
  timeout?: number;
  asyncOnly?: boolean;
  ui?: string;
  files?: string[] | string;
}
