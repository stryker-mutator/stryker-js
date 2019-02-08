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
  constructor(private readonly factoryName: string) { }

  private readonly classMap: { [name: string]: new (settings: TSettings) => T } = Object.create(null);

  /**
   * Retrieves the known names registered to this factory.
   * @returns A list of sorted items which are registered.
   */
  public knownNames(): string[] {
    const keys = Object.keys(this.classMap);
    keys.sort();
    return keys;
  }

  /**
   * Registers a constructor function to this factory.
   * @param name The name of the item.
   * @param constructor The constructor of the item.
   * @deprecated use `declareClassPlugin` or `declareFactoryPlugin`. See https://github.com/stryker-mutator/stryker-handbook/blob/master/stryker/api/plugins.md
   */
  public register(name: string, constructor: new (settings: TSettings) => T ): void {
    process.emitWarning(`DEPRECATED. The "${name}" ${this.factoryName} plugin is registered with the deprecated "Factory" api. You might need to update your plugins. If you are the plugin creator, please see https://github.com/stryker-mutator/stryker-handbook/blob/master/stryker/api/plugins.md`);
    this.classMap[name] = constructor;
  }

  /**
   * Creates a new instance of a registered item.
   * @param name The name of the item.
   * @param settings The settings object related to the item.
   * @throws Will throw if no item has been registered with the specified name
   * @returns A new instance of the requested item.
   */
  public create(name: string, settings: TSettings): T {
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
