import * as schema from 'mutation-testing-report-schema/api';

export interface ConfigureParams {
  /**
   * The (relative or absolute) path to mutation testing framework's config file to load.
   */
  configFilePath?: string;
}

export interface ConfigureResult {
  /**
   * The mutation testing server protocol major version that the client supports (major)
   * For example, "1"
   */
  version: string;
}

export interface DiscoverParams {
  /**
   * The glob patterns to files to discover mutant in, or undefined to discover mutants in the entire project.
   */
  globPatterns?: string[];
}

export interface MutationTestParams {
  /**
   * The glob patterns to mutation test.
   */
  globPatterns?: string[];
}

export interface MutationTestPartialResult {
  mutants: schema.MutantResult[];
}

type DiscoveredMutant = Pick<schema.MutantResult, 'id' | 'location' | 'description' | 'mutatorName' | 'replacement'>;

export interface DiscoverResult {
  mutants: readonly DiscoveredMutant[];
}

export const rpcMethods = Object.freeze({
  configure: 'configure',
  discover: 'discover',
  mutationTest: 'mutationTest',
  reportMutationTestProgressNotification: 'reportMutationTestProgress',
});
