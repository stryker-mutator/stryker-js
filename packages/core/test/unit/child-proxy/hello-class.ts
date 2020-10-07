import { tokens } from '@stryker-mutator/api/plugin';

export class HelloClass {
  public static inject = tokens('name');
  constructor(public name: string) {}
  public sayHello() {
    return `hello from ${this.name}`;
  }
  public sayDelayed() {
    return new Promise((res) => res(`delayed hello from ${this.name}`));
  }

  public say(...things: string[]) {
    return `hello ${things.join(' and ')}`;
  }

  public sum(a: number, b: number) {
    return a + b;
  }

  public reject() {
    return Promise.reject(new Error('Rejected'));
  }

  public throw(message: string) {
    throw new Error(message);
  }
}
