import { Config } from 'stryker-api/config';
import { Transpiler, TranspilerFactory, TranspilerOptions } from 'stryker-api/transpile';
import { File } from 'stryker-api/core';

class MyTranspiler implements Transpiler {

  constructor(private transpilerOptions: TranspilerOptions) { }

  transpile(files: ReadonlyArray<File>): Promise<ReadonlyArray<File>> {
    return Promise.resolve([new File('foo/bar.js', 'bar content')]);
  }
}

TranspilerFactory.instance().register('my-transpiler', MyTranspiler);
const transpiler = TranspilerFactory.instance().create('my-transpiler', { produceSourceMaps: true, config: new Config() });

transpiler.transpile([new File('foo/bar.ts', 'foobar')]).then((files: ReadonlyArray<File>) => {
  console.log(JSON.stringify(files));
});