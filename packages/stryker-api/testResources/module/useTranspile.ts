import { Config } from 'stryker-api/config';
import { Transpiler, FileLocation, TranspileResult, TranspilerFactory, TranspilerOptions } from 'stryker-api/transpile';
import { TextFile, File, FileKind } from 'stryker-api/core';

class MyTranspiler implements Transpiler {

  constructor(private transpilerOptions: TranspilerOptions) { }

  transpile(files: File[]): TranspileResult {
    return {
      outputFiles: [{ name: 'foo', content: 'string', kind: FileKind.Text, mutated: this.transpilerOptions.keepSourceMaps, included: false }],
      error: null
    };
  }
  mutate(file: File[]): TranspileResult {
    return {
      outputFiles: [{ name: 'bar', kind: FileKind.Binary, content: Buffer.from([2, 3]), mutated: true, included: false }],
      error: 'no error at all'
    };
  }
  getMappedLocation(sourceFileLocation: FileLocation): FileLocation {
    return sourceFileLocation;
  }
}

TranspilerFactory.instance().register('my-transpiler', MyTranspiler);
const transpiler = TranspilerFactory.instance().create('my-transpiler', { keepSourceMaps: true, config: new Config() });

const transpileResult = transpiler.transpile([{ kind: FileKind.Text, content: '', name: '', mutated: true, included: false }]);
console.log(JSON.stringify(transpileResult));
const mutateResult = transpiler.mutate([{ kind: FileKind.Text, content: '', name: '', mutated: true, included: false }]);
console.log(JSON.stringify(mutateResult));

console.log(JSON.stringify(
  transpiler.getMappedLocation({ fileName: 'my-file', start: { line: 1, column: 2 }, end: { line: 3, column: 4 } })
));