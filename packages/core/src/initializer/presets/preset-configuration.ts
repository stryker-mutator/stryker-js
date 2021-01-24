import { File, PartialStrykerOptions } from '@stryker-mutator/api/core';

export default interface PresetConfiguration {
  config: PartialStrykerOptions;
  guideUrl: string;
  dependencies: string[];
  additionalConfigFiles?: File[];
}
