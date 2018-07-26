import { File } from 'stryker-api/core';
import { getLogger } from 'stryker-api/logging';

export default class Echo {

  private logger = getLogger(Echo.name);

  constructor(public name: string) {

  }

  say(value: string) {
    return `${this.name}: ${value}`;
  }

  sayDelayed(value: string, delay: number) {
    return new Promise<string>(res => {
      setTimeout(() => {
        res(this.say(`${value} (${delay} ms)`));
      }, delay);
    });
  }

  echoFile(file: File) {
    return file.textContent;
  }

  exit(code: number) {
    process.exit(code);
    return new Promise(res => {/*never resolve*/ });
  }

  readFile() {
    return new File('foobar.txt', 'hello foobar');
  }

  cwd() {
    return process.cwd();
  }

  debug(message: string) {
    this.logger.debug(message);
  }

  trace(message: string) {
    this.logger.trace(message);
  }

  reject(error: string) {
    return Promise.reject(new Error(error));
  }

  stdout(...args: string[]) {
    args.forEach(arg => console.log(arg));
  }

  stderr(...args: string[]) {
    args.forEach(arg => console.error(arg));
  }

  memoryLeak() {
    const arr: number[] = [];
    while (true) {
      arr.push(1);
    }
  }
}