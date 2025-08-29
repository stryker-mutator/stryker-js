import { EOL } from 'os';

// 8kB
const DEFAULT_MAX_SIZE = 8192;

export class StringBuilder {
  private currentLength = 0;
  private readonly strings: string[] = [];
  private readonly maxSize = DEFAULT_MAX_SIZE;

  public append(str: string): void {
    this.strings.push(str);
    this.currentLength += str.length;
    while (this.currentLength > this.maxSize && this.strings.length > 1) {
      const shifted = this.strings.shift()!;
      this.currentLength -= shifted.length;
    }
  }

  public toString(): string {
    return this.strings.join('');
  }

  public static concat(...builders: StringBuilder[]): string {
    return builders
      .map((b) => b.toString())
      .filter(Boolean)
      .join(EOL);
  }
}
