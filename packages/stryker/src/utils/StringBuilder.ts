import * as os from 'os';

const DEFAULT_MAX_SIZE = 2048;

export default class StringBuilder {
  private currentLength = 0;
  private strings: string[] = [];
  private readonly maxSize = DEFAULT_MAX_SIZE;

  append(str: string) {
    this.strings.push(str);
    this.currentLength += str.length;
    while (this.currentLength > this.maxSize && this.strings.length > 1) {
      const popped = this.strings.shift() as string;
      this.currentLength -= popped.length;
    }
  }

  toString() {
    return this.strings.join(os.EOL);
  }
}