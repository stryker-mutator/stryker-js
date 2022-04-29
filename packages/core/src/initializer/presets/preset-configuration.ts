import { PartialStrykerOptions } from '@stryker-mutator/api/core';
import { File } from '@stryker-mutator/util';

export interface PresetConfiguration {
  config: PartialStrykerOptions;
  guideUrl: string;
  dependencies: string[];
  additionalConfigFiles?: File[];
}
