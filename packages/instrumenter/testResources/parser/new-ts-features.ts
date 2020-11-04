class Person {
  #name = 'unknown';

  get name(): string {
    return this.#name;
  }
  set name(value: string) {
    if(value.length < 2){
      throw new Error('Name should be at least 2 characters long');
    }
    this.#name = value;
  }
}
