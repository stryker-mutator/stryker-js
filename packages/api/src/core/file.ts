/**
 * Represents a file within Stryker. Could be a strictly in-memory file.
 */
export class File {
  private _textContent: string | undefined;
  private readonly _content: Buffer;

  /**
   * Creates a new File to be used within Stryker.
   * @param name The full name of the file (inc path)
   * @param content The buffered or string content of the file
   */
  constructor(public readonly name: string, content: Buffer | string) {
    if (typeof content === 'string') {
      this._content = Buffer.from(content);
      this._textContent = content;
    } else {
      this._content = content;
    }
  }

  /**
   * Gets the underlying content as buffer.
   */
  public get content(): Buffer {
    return this._content;
  }

  /**
   * Gets the underlying content as string using utf8 encoding.
   */
  public get textContent(): string {
    if (!this._textContent) {
      this._textContent = this.content.toString();
    }
    return this._textContent;
  }
}
