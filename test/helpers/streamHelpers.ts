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

export function readable() {
  const input = new Readable();
  input._read = function noop() { };
  return input;
}