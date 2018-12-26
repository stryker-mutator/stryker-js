export default class HelloClass {
  constructor(public name: string) { }

  public reject() {
    return Promise.reject(new Error('Rejected'));
  }

  public say(...things: string[]) {
    return `hello ${things.join(' and ')}`;
  }
  public sayDelayed() {
    return new Promise(res => res(`delayed hello from ${this.name}`));
  }
  public sayHello() {
    return `hello from ${this.name}`;
  }

  public sum(a: number, b: number) {
    return a + b;
  }

  public throw(message: string) {
    throw new Error(message);
  }
}
