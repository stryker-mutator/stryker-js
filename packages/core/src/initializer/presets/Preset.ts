import { PresetConfiguration } from './PresetConfiguration';

export interface Preset {
  readonly name: string;
  createConfig(): Promise<PresetConfiguration>;
}
