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

  readFile() {
    return new File('foobar.txt', 'hello foobar');
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
}