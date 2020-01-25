import { Transpiler } from '@stryker-mutator/api/transpile';
import { File } from '@stryker-mutator/api/core';

class MyTranspiler implements Transpiler {

  public transpile(files: ReadonlyArray<File>): Promise<ReadonlyArray<File>> {
    return Promise.resolve([new File('foo/bar.js', 'bar content')]);
  }
}


new MyTranspiler().transpile([new File('foo/bar.ts', 'foobar')]).then(files => {
  console.log(JSON.stringify(files));
});
