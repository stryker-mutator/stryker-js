import { RunResult } from 'jest';

export default interface JestTestAdapter {
  run(config: object, projectRoot: string, mutatedFileName?: string): Promise<RunResult>;
}
