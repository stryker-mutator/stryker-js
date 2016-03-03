
abstract class Factory<T> {

  constructor(private factoryName: string) {
  }

  private classMap: { [name: string]: { new (options: any): T } } = Object.create(null);
  
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
  register(name: string, constructor: { new (options: any): T }) : void {
    this.classMap[name] = constructor;
  }
   
  /**
   * Creates a new 
   */
  create(name: string, options: any): T {
    if (Object.keys(this.classMap).indexOf(name) < 0) {
      throw new Error(`Could not find a ${this.factoryName} with name ${name}, did you install it correctly?`);
    } else {
      return new this.classMap[name](options);
    }
  }
}

export default Factory;