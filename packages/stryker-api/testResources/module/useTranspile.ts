import { Config } from 'stryker-api/config';
import { Transpiler, FileLocation, TranspileResult, TranspilerFactory, TranspilerOptions } from 'stryker-api/transpile';
import { TextFile, File } from 'stryker-api/core';

class MyTranspiler implements Transpiler {

  constructor(private transpilerOptions: TranspilerOptions) { }

  transpile(files: File[]): Promise<TranspileResult> {
    return Promise.resolve({
      outputFiles: [{ name: 'foo', content: 'string', mutated: this.transpilerOptions.keepSourceMaps, included: false }],
      error: null
    });
  }
  mutate(file: File): Promise<TranspileResult> {
    return Promise.resolve({
      outputFiles: [{ name: 'bar', content: Buffer.from([2, 3]), mutated: true, included: false }],
      error: 'no error at all'
    });
  }
  getMappedLocation(sourceFileLocation: FileLocation): FileLocation {
    return sourceFileLocation;
  }
}

TranspilerFactory.instance().register('my-transpiler', MyTranspiler);
const transpiler = TranspilerFactory.instance().create('my-transpiler', { keepSourceMaps: true, config: new Config() });

transpiler.transpile([{ content: '', name: '', mutated: true, included: false }]).then(
  result => console.log(JSON.stringify(result))
);
transpiler.mutate({ content: '', name: '', mutated: true, included: false }).then(
  result => console.log(JSON.stringify(result))
);
console.log(JSON.stringify(
  transpiler.getMappedLocation({ fileName: 'my-file', start: { line: 1, column: 2 }, end: { line: 3, column: 4 } })
));