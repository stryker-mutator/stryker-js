import { expect } from 'chai';
import BooleanSubstitutionMutator from '../../../src/mutators/BooleanSubstitutionMutator';
import Copy from '../../../src/helpers/Copy';
import BabelParser from '../../../src/helpers/BabelParser';

describe('BooleanSubstitutionMutator', () => {
  const mutator = new BooleanSubstitutionMutator();

  it('should remove a unary "!"', () => {
    const code = '!(1 > 2);';
    let ast = BabelParser.getAst(code);
    let nodes = BabelParser.getNodes(ast);
    
    let mutatedNodes = mutator.mutate(nodes[2], Copy);
    let generatedCode = BabelParser.generateCode(Copy(ast, true), mutatedNodes[0]);

    expect(generatedCode).to.equal('1 > 2');
    expect(mutatedNodes[0].start).to.equal(0);
    expect(mutatedNodes[0].end).to.equal(8);
  });
});