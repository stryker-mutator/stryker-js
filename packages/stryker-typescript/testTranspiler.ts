import TypeScriptTranspiler from './src/TypeScriptTranspiler';
import * as path from 'path';
import * as fs from 'fs';

const thisFile = path.resolve('sample.ts');
const transpiler = new TypeScriptTranspiler([{
  path: thisFile,
  content: fs.readFileSync(thisFile, 'utf8')
}]);

transpiler.compile();
transpiler.mutate().forEach(mutant => {
  console.log(`Mutated!: ${mutant.getMutatedCode()}`);
});
