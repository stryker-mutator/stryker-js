import { File } from 'stryker-api/core';
import { getLogger } from 'stryker-api/logging';

export default class Echo {

  private readonly logger = getLogger(Echo.name);

  constructor(public name: string) { }

  public say(value: string) {
    return `${this.name}: ${value}`;
  }

  public sayDelayed(value: string, delay: number) {
    return new Promise<string>(res => {
      setTimeout(() => {
        res(this.say(`${value} (${delay} ms)`));
      }, delay);
    });
  }

  public echoFile(file: File) {
    return file.textContent;
  }

  public exit(code: number) {
    process.exit(code);
    return new Promise(res => {/*never resolve*/ });
  }

  public readFile() {
    return new File('foobar.txt', 'hello foobar');
  }

  public cwd() {
    return process.cwd();
  }

  public debug(message: string) {
    this.logger.debug(message);
  }

  public trace(message: string) {
    this.logger.trace(message);
  }

  public reject(error: string) {
    return Promise.reject(new Error(error));
  }

  public stdout(...args: string[]) {
    args.forEach(arg => console.log(arg));
  }

  public stderr(...args: string[]) {
    args.forEach(arg => console.error(arg));
  }

  public memoryLeak() {
    const arr: number[] = [];
    while (true) {
      arr.push(1);
    }
  }
}
