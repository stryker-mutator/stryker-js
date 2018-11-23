import { StrykerPresetConfig } from './StrykerConf';

abstract class StrykerPreset {
  public abstract readonly name: string;
  public abstract async createConfig(): Promise<StrykerPresetConfig>;
}
export default StrykerPreset;
