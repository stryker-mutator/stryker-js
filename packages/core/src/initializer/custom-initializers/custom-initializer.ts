import { PartialStrykerOptions } from '@stryker-mutator/api/core';
import { Immutable } from '@stryker-mutator/util';

export interface CustomInitializer {
  readonly name: string;
  createConfig(): Promise<CustomInitializerConfiguration>;
}

export interface CustomInitializerConfiguration {
  config: Immutable<PartialStrykerOptions>;
  guideUrl: string;
  dependencies: string[];
  additionalConfigFiles?: Record<string, string>;
}
