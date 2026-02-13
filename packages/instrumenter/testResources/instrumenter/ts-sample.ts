const bar: number = 40 + 2;

class Person {
  #name = 'unknown';

  get name(): string {
    return this.#name;
  }
  set name(value: string) {
    if (value.length < 2) {
      throw new Error('Name should be at least 2 characters long');
    }
    this.#name = value;
  }
}

const foo = () => {
  return false;
};

foo();
console.log();
throw new Error();

const add = (a: number, b: number) => {
  return a + b;
};

const a = 1;
const b = 2;
add(a, b);
