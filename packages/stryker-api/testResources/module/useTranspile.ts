import { Config } from 'stryker-api/config';
import { Transpiler, FileLocation, TranspileResult, TranspilerFactory, TranspilerOptions } from 'stryker-api/transpile';
import { TextFile, File, FileKind } from 'stryker-api/core';

class MyTranspiler implements Transpiler {

  constructor(private transpilerOptions: TranspilerOptions) { }

  transpile(files: File[]): Promise<TranspileResult> {
    return Promise.resolve({
      outputFiles: [{ name: 'foo', content: 'string', kind: FileKind.Text, mutated: this.transpilerOptions.keepSourceMaps, included: false, transpiled: true } as File],
      error: null
    });
  }
  getMappedLocation(sourceFileLocation: FileLocation): FileLocation {
    return sourceFileLocation;
  }
}

TranspilerFactory.instance().register('my-transpiler', MyTranspiler);
const transpiler = TranspilerFactory.instance().create('my-transpiler', { keepSourceMaps: true, config: new Config() });

transpiler.transpile([{ kind: FileKind.Text, content: '', name: '', mutated: true, included: false, transpiled: true }]).then((transpileResult) => {
  console.log(JSON.stringify(transpileResult));

  console.log(JSON.stringify(
    transpiler.getMappedLocation({ fileName: 'my-file', start: { line: 1, column: 2 }, end: { line: 3, column: 4 } })
  ));
});