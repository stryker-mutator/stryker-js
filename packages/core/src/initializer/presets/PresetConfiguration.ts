import { File, PartialStrykerOptions } from '@stryker-mutator/api/core';

export default interface PresetConfiguration {
  config: PartialStrykerOptions;
  handbookUrl: string;
  dependencies: string[];
  additionalConfigFiles?: File[];
}
