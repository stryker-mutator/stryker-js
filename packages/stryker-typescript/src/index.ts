import MutatorFactory from './MutatorFactory';
import BinaryExpressionMutator from './mutators/BinaryExpressionMutator';
import RemoveConditionalsMutator from './mutators/RemoveConditionalsMutator';

function registerMutators() {
  const factory = MutatorFactory.instance();
  factory.register('BinaryExpression', BinaryExpressionMutator);
  factory.register('RemoveConditionals', RemoveConditionalsMutator);
}

registerMutators();



// Temporary code for testing purposes
import TypeScriptTranspiler from './TypeScriptTranspiler';
let transpiler = new TypeScriptTranspiler([
  { path: 'C:\\temp\\myfile.ts', content: 'const bestname = "Stryker";' }
]);
let compiledFiles = transpiler.compile();
if (compiledFiles.length > 0) {
  let mutants = transpiler.mutate();
  console.log(`Generated ${mutants.length} mutants`);
}
