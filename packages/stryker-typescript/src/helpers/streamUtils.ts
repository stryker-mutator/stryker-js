
export function streamToString(stream: NodeJS.ReadableStream, encoding = 'utf8') {
  stream.setEncoding(encoding);
  return new Promise<string>((resolve, reject) => {
    const chunks: string[] = [];
    stream.on('error', (err: any) => {
      reject(err);
    });
    stream.on('data', (chunk: Buffer | string) => {
      chunks.push(chunk.toString());
    });
    stream.on('end', () => {
      resolve(chunks.join(''));
    });
  });
}
