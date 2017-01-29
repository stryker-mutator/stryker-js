import ConstantNumberMutator from '../../../src/mutators/ConstantNumberMutator';
import { expect } from 'chai';
import { copy } from '../../../src/utils/objectUtils';
import * as parser from '../../../src/utils/parserUtils';
import * as estree from 'estree';

describe('ConstantNumberMutator', () => {
    let mutator: ConstantNumberMutator;

    beforeEach(() => mutator = new ConstantNumberMutator());

    const mutateProgram = (programString: string) => {
        const program = parser.parse(programString);
        const variableDeclaration = (program.body[0] as estree.VariableDeclaration);
        
        return {
            node: (variableDeclaration.declarations[0].init as estree.SimpleLiteral),
            mutatedNode: (mutator.applyMutations(variableDeclaration, copy) as estree.SimpleLiteral)
        };
    };

    describe('Should mutate', () => {
        it('a number not equal to 0', () => {
            const result = mutateProgram(`const testValue = 54;`);

            expect(result.mutatedNode).to.be.ok;
            expect(result.mutatedNode.nodeID).to.be.eq(result.node.nodeID);
            expect(result.mutatedNode.value).to.be.eq(0);
        });
        it('a number equal to 0', () => {
            const result = mutateProgram(`const testValue = 0;`);

            expect(result.mutatedNode).to.be.ok;
            expect(result.mutatedNode.nodeID).to.be.eq(result.node.nodeID);
            expect(result.mutatedNode.value).to.be.eq(1);
        });
    });

    describe('Should not mutate', () => {
        it('a RegEx value', () => {
            const result = mutateProgram(`const testValue = /[0-9]/;`);
            expect(result.mutatedNode).to.be.undefined;
        });
        it('a string value', () => {
            const result = mutateProgram(`const testValue = 'Some string';`);
            expect(result.mutatedNode).to.be.undefined;
        });
        it('a boolean value', () => {
            const result = mutateProgram(`const testValue = true;`);
            expect(result.mutatedNode).to.be.undefined;
        });
    });
});