import { RunResult } from 'jest';

export default interface JestTestAdapter {
  run(config: object, projectRoot: string, fileNameUnderTest?: string): Promise<RunResult>;
}
