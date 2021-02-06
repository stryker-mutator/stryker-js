import { tokens } from '@stryker-mutator/api/plugin';

export class HelloClass {
  public static inject = tokens('name');
  constructor(public name: string) {}
  public sayHello(): string {
    return `hello from ${this.name}`;
  }
  public sayDelayed(): Promise<unknown> {
    return new Promise((res) => res(`delayed hello from ${this.name}`));
  }

  public say(...things: string[]): string {
    return `hello ${things.join(' and ')}`;
  }

  public sum(a: number, b: number): number {
    return a + b;
  }

  public reject(): Promise<never> {
    return Promise.reject(new Error('Rejected'));
  }

  public throw(message: string): never {
    throw new Error(message);
  }
}
