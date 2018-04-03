import { File } from 'stryker-api/core';

export default class Echo {

  constructor(private name: string) {
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

  reject(error: string) {
    return Promise.reject(new Error(error));
  }
}