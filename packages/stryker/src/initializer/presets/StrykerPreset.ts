import { StrykerPresetConfig } from './StrykerConf';

abstract class StrykerPreset {
  public abstract async createConfig(): Promise<StrykerPresetConfig>;
}
export default StrykerPreset;
