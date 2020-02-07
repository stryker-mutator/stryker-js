import strykerJest from '../../typings/strykerJest';

export default interface JestTestAdapter {
  run(config: object, projectRoot: string, fileNameUnderTest?: string): Promise<strykerJest.RunResult>;
}
