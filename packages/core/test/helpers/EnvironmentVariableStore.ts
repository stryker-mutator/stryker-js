/**
 * A class that lets you manipulate env variables and reset them after a test
 */
export class EnvironmentVariableStore {
  private readonly originals: { [key: string]: string | undefined } = Object.create(null);

  private store(key: string) {
    if (!(key in this.originals)) {
      this.originals[key] = process.env[key];
    }
  }

  public set(key: string, value: string) {
    this.store(key);
    process.env[key] = value;
  }

  public unset(key: string) {
    this.store(key);
    delete process.env[key];
  }

  public restore() {
    Object.keys(this.originals).forEach(key => {
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
