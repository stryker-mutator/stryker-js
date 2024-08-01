// @ts-nocheck
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


// Explicit resource managment

export function doSomeWork() {
  using file = new TempFile('.some_temp_file');
  // use file...
  if (someCondition()) {
    // do some more work...
    return;
  }
}

async function func() {
  await using a = loggy('a');
  await using b = loggy('b');
  {
    await using c = loggy('c');
    await using d = loggy('d');
  }
  await using e = loggy('e');
  return;
  // Unreachable.
  // Never created, never disposed.
  await using f = loggy('f');
}
