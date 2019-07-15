/**
 * Represents a file within Stryker. Could be a strictly in-memory file.
 */
export default class File {

  private innerTextContent: string | undefined;
  private readonly innerContent: Buffer;

  /**
   * Creates a new File to be used within Stryker.
   * @param name The full name of the file (inc path)
   * @param content The buffered or string content of the file
   */
  constructor(public readonly name: string, content: Buffer | string) {
    if (typeof content === 'string') {
      this.innerContent = Buffer.from(content);
      this.innerTextContent = content;
    } else {
      this.innerContent = content;
    }
  }

  /**
   * Gets the underlying content as buffer.
   */
  get content(): Buffer {
    return this.innerContent;
  }

  /**
   * Gets the underlying content as string using utf8 encoding.
   */
  get textContent(): string {
    if (!this.innerTextContent) {
      this.innerTextContent = this.innerContent.toString();
    }
    return this.innerTextContent;
  }
}
