import { Readable, Duplex, Stream } from 'stream';

export function streamToString(stream: Stream) {
  return new Promise<string>(resolve => {
    const chunks: string[] = [];
    stream.on('data', (chunk: Buffer | string) => {
      chunks.push(chunk.toString());
    });
    stream.on('end', () => {
      resolve(chunks.join(''));
    });
  });
}

export function readable(): Readable {
  const input = new SimpleReadable();
  return input;
}

class SimpleReadable extends Readable {
  _read() {
    // noop
  }
}