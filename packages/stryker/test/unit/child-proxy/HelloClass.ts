export default class HelloClass {
  constructor(public name: string) { }
  sayHello() {
    return `hello from ${this.name}`;
  }
  sayDelayed() {
    return new Promise(res => res(`delayed hello from ${this.name}`));
  }

  say(...things: string[]) {
    return `hello ${things.join(' and ')}`;
  }

  reject() {
    return Promise.reject(new Error('Rejected'));
  }

  throw(message: string) {
    throw new Error(message);
  }
}
