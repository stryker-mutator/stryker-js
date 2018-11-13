import { RunResult } from 'jest';

export default interface JestTestAdapter {
  run(config: object, projectRoot: string, enableFindRelatedTests: boolean, mutatedFileName?: string): Promise<RunResult>;
}
