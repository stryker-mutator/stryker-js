const CONTENT_LENGTH_HEADER = 'Content-Length:';
const CARRIAGE_RETURN_CODE = '\r'.charCodeAt(0);
const LINE_FEED_CODE = '\n'.charCodeAt(0);

export class JsonRpcEventDeserializer {
  #chunk = Buffer.alloc(0);

  deserialize(data: Buffer): unknown[] {
    this.#chunk = Buffer.concat([this.#chunk, data]);
    const events: unknown[] = [];
    do {
      const headerInfo = parseHeader(this.#chunk);
      if (!headerInfo) {
        break;
      }
      const { header, contentStart } = headerInfo;
      const contentLengthIndex = header.indexOf(CONTENT_LENGTH_HEADER);
      const contentLength = parseInt(
        header
          .substring(contentLengthIndex + CONTENT_LENGTH_HEADER.length)
          .trim(),
        10,
      );
      const contentEnd = contentStart + contentLength;
      if (this.#chunk.length < contentEnd) {
        // Not enough data yet, wait for next events
        break;
      }
      const content = this.#chunk.subarray(contentStart, contentEnd).toString();
      this.#chunk = this.#chunk.subarray(contentEnd);
      events.push(JSON.parse(content));
    } while (this.#chunk.length > 0);
    return events;
  }
}
function parseHeader(chunk: Buffer) {
  for (let i = 0; i < chunk.length; i++) {
    if (
      chunk[i] === CARRIAGE_RETURN_CODE &&
      chunk[i + 1] === LINE_FEED_CODE &&
      chunk[i + 2] === CARRIAGE_RETURN_CODE &&
      chunk[i + 3] === LINE_FEED_CODE
    ) {
      return { header: chunk.subarray(0, i).toString(), contentStart: i + 4 };
    }
  }
  return undefined;
}
