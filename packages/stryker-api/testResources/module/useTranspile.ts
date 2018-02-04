import { Config } from 'stryker-api/config';
import { Transpiler, TranspileResult, TranspilerFactory, TranspilerOptions } from 'stryker-api/transpile';
import { TextFile, File, FileKind } from 'stryker-api/core';

class MyTranspiler implements Transpiler {

  constructor(private transpilerOptions: TranspilerOptions) { }

  transpile(files: File[]): Promise<TranspileResult> {
    return Promise.resolve({
      outputFiles: [{ name: 'foo', content: 'bar', kind: FileKind.Text, mutated: this.transpilerOptions.produceSourceMaps, included: false, transpiled: true } as File],
      error: null
    });
  }
}

TranspilerFactory.instance().register('my-transpiler', MyTranspiler);
const transpiler = TranspilerFactory.instance().create('my-transpiler', { produceSourceMaps: true, config: new Config() });

transpiler.transpile([{ kind: FileKind.Text, content: '', name: '', mutated: true, included: false, transpiled: true }]).then((transpileResult) => {
  console.log(JSON.stringify(transpileResult));
});