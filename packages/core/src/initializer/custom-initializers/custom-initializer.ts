import { PartialStrykerOptions } from '@stryker-mutator/api/core';

export interface CustomInitializer {
  readonly name: string;
  createConfig(): Promise<CustomInitializerConfiguration>;
}

export interface CustomInitializerConfiguration {
  config: PartialStrykerOptions;
  guideUrl: string;
  dependencies: string[];
  additionalConfigFiles?: Record<string, string>;
}
