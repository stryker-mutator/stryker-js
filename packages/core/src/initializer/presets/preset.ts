import { PresetConfiguration } from './preset-configuration.js';

export interface Preset {
  readonly name: string;
  createConfig(): Promise<PresetConfiguration>;
}
