import { PresetConfiguration } from './preset-configuration';

export interface Preset {
  readonly name: string;
  createConfig(): Promise<PresetConfiguration>;
}
