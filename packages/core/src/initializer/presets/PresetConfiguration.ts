import { StrykerOptions } from '@stryker-mutator/api/core';

export default interface PresetConfiguration {
  config: Partial<StrykerOptions>;
  handbookUrl: string;
  dependencies: string[];
}
