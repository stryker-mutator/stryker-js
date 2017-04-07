/**
 * Represents a Factory to which items can register themselves and which can be used to create instances of said items.
 * <TSettings> represents the type of the (one single) constructor argument used to create the instances.
 * <T> represents the Type of the items created by this factory. 
 */
abstract class Factory<TSettings, T> {

  /**
   * Creates a new Factory.
   * @param factoryName The name of the Factory.
   */
  constructor(private factoryName: string) {
  }

  private classMap: { [name: string]: { new (settings: TSettings): T } } = Object.create(null);

  /**
   * Retrieves the known names registered to this factory.
   * @returns A list of sorted items which are registered.
   */
  knownNames(): string[] {
    let keys = Object.keys(this.classMap);
    keys.sort();
    return keys;
  }

  /**
   * Registers a constructor function to this factory.
   * @param name The name of the item.
   * @param constructor The constructor of the item.
   */
  register(name: string, constructor: { new (settings: TSettings): T }): void {
    this.classMap[name] = constructor;
  }
   
  /**
   * Creates a new instance of a registered item.
   * @param name The name of the item.
   * @param settings The settings object related to the item.
   * @throws Will throw if no item has been registered with the specified name
   * @returns A new instance of the requested item.
   */
  create(name: string, settings: TSettings): T {
    if (Object.keys(this.classMap).indexOf(name) < 0) {
      throw new Error(`Could not find a ${this.factoryName} with name ${name}, did you install it correctly (for example: npm install --save-dev ${this.importSuggestion(name)})?`);
    } else {
      return new this.classMap[name](settings);
    }
  }

  protected importSuggestion(name: string): string {
    return 'stryker-' + name;
  }
}

export default Factory;