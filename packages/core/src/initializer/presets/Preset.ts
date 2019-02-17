import PresetConfig from './PresetConfiguration';

interface Preset {
  readonly name: string;
  createConfig(): Promise<PresetConfig>;
}
export default Preset;
