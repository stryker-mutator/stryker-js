import { PartialStrykerOptions } from '@stryker-mutator/api/core';

export interface PresetConfiguration {
  config: PartialStrykerOptions;
  guideUrl: string;
  dependencies: string[];
  additionalConfigFiles?: Record<string, string>;
}
