import PresetConfig from './preset-configuration';

interface Preset {
  readonly name: string;
  createConfig(): Promise<PresetConfig>;
}
export default Preset;
