import * as os from 'os';

export default class StringBuilder {
  private maxSize = 2048;
  private currentLength = 0;
  private strings: string[] = [];

  append(str: string) {
    this.strings.push(str);
    this.currentLength += str.length;
    while (this.currentLength > this.maxSize && this.strings.length > 0) {
      const popped = this.strings.shift() as string;
      this.currentLength -= popped.length;
    }
  }

  toString() {
    return this.strings.join(os.EOL);
  }
}