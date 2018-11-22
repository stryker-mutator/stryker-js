abstract class StrykerPreset {
  public abstract dependencies: string[];
  public abstract conf: string;
  public async prompt(): Promise<void> {
    return;
  }
}

export default StrykerPreset;
