import { RunResult } from 'jest';

export default interface JestTestAdapter {
  run(config: Object, projectRoot: string): Promise<RunResult>;
}