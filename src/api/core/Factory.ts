
abstract class Factory<TSettings, T> {

  constructor(private factoryName: string) {
  }

  private classMap: { [name: string]: { new (settings: TSettings): T } } = Object.create(null);

  /**
   * Retrieves the known names registered to this factory
   */
  knownNames() {
    var keys = Object.keys(this.classMap);
    keys.sort();
    return keys;
  }

  /**
   * Registeres a constructor function to this factory 
   */
  register(name: string, constructor: { new (settings: TSettings): T }): void {
    this.classMap[name] = constructor;
  }
   
  /**
   * Creates a new 
   */
  create(name: string, settings: TSettings): T {
    if (Object.keys(this.classMap).indexOf(name) < 0) {
      throw new Error(`Could not find a ${this.factoryName} with name ${name}, did you install it correctly (for example: npm install --save-dev ${this.importSuggestion(name)}?`);
    } else {
      return new this.classMap[name](settings);
    }
  }

  protected importSuggestion(name: string): string {
    return 'stryker-' + name;
  }
}

export default Factory;