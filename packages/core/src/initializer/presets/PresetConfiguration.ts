import { StrykerOptions } from '@stryker-mutator/api/core';

export interface PresetConfiguration {
  config: Partial<StrykerOptions>;
  handbookUrl: string;
  dependencies: string[];
}
