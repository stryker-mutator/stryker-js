import { verifySpecification, expectMutation } from './mutatorAssertions';
import StringLiteralMutator from '../../../src/mutator/StringLiteralMutator';
import StringLiteralMutatorSpec from 'stryker-mutator-specification/src/StringLiteralMutatorSpec';
import NodeMutator from '../../../src/mutator/NodeMutator';

verifySpecification(StringLiteralMutatorSpec, StringLiteralMutator);

describe('StringLiteralMutator - Extras', () => {

  let mutator: NodeMutator;
  before(() => {
    mutator = new StringLiteralMutator();
  });

  it('should not mutate module declarations', () => {
    expectMutation(mutator, 'declare module "new-foo-module";');
    expectMutation(mutator, 'declare module "*!foo" { }');
  });

  it('should not mutate `import = require()` statements', () => {
    expectMutation(mutator, 'import foo = require("foo");');
  });
});
