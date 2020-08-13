import { EOL } from 'os';

const DEFAULT_MAX_SIZE = 2048;

export class StringBuilder {
  private currentLength = 0;
  private readonly strings: string[] = [];
  private readonly maxSize = DEFAULT_MAX_SIZE;

  public append(str: string) {
    this.strings.push(str);
    this.currentLength += str.length;
    while (this.currentLength > this.maxSize && this.strings.length > 1) {
      const popped = this.strings.shift() as string;
      this.currentLength -= popped.length;
    }
  }

  public toString() {
    return this.strings.join('');
  }

  public static concat(...builders: StringBuilder[]): string {
    return builders
      .map((b) => b.toString())
      .filter(Boolean)
      .join(EOL);
  }
}
