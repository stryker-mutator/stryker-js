/**
 * A class that lets you manipulate env variables and reset them after a test
 */
export class EnvironmentVariableStore {
  private readonly originals: Record<string, string | undefined> = Object.create(null);

  private store(key: string) {
    if (!(key in this.originals)) {
      this.originals[key] = process.env[key];
    }
  }

  public set(key: string, value: string): void {
    this.store(key);
    process.env[key] = value;
  }

  public unset(key: string): void {
    this.store(key);
    delete process.env[key];
  }

  public restore(): void {
    Object.keys(this.originals).forEach((key) => {
      const value = this.originals[key];
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
      delete this.originals[key];
    });
  }
}
