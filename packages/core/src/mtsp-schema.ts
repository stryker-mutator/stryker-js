import { MutantResult } from '@stryker-mutator/api/core';
import * as schema from 'mutation-testing-report-schema/api';

export interface InitializeParams {
  /**
   * The mutation testing server protocol version that the client supports (major.minor)
   * For example, "1.0"
   */
  version: string;

  /**
   * The URI of the mutation testing framework's config file to load.
   */
  configUri?: string;
}

export interface InitializeResult {
  // Empty, can be extended in the future
}

export interface DiscoverParams {
  /**
   * The glob patterns to files to discover mutant in, or undefined to discover mutants in the entire project.
   */
  globPatterns?: string[];
}

type DiscoveredMutant = Pick<schema.MutantResult, 'id' | 'location' | 'description' | 'mutatorName' | 'replacement'>;

export interface DiscoverResult {
  mutants: readonly DiscoveredMutant[];
}
