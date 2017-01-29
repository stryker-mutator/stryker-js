import ConstantNumberMutator from '../../../src/mutators/ConstantNumberMutator'
import { expect } from 'chai';
import { copy } from '../../../src/utils/objectUtils';
import * as parser from '../../../src/utils/parserUtils';
import * as estree from 'estree';

describe('ConstantNumberMutator', () => {
    let mutator: ConstantNumberMutator;

    beforeEach(() => mutator = new ConstantNumberMutator());

    describe('Should mutate', () => {
        it('a number not equal to 0', () => {
            const program = parser.parse(`const testValue = 54;`);
            const variableDeclaration = (program.body[0] as estree.VariableDeclaration);
            
            const actual = <estree.SimpleLiteral>mutator.applyMutations(variableDeclaration, copy);
            const originalLiteral = (variableDeclaration.declarations[0].init as estree.SimpleLiteral);

            expect(actual).to.be.ok;
            expect(actual.nodeID).to.be.eq(originalLiteral.nodeID);
            expect(actual.value).to.be.eq(0);
        });
        it('a number equal to 0', () => {
            const program = parser.parse(`const testValue = 0;`);
            const variableDeclaration = (program.body[0] as estree.VariableDeclaration);
            
            const actual = <estree.SimpleLiteral>mutator.applyMutations(variableDeclaration, copy);
            const originalLiteral = (variableDeclaration.declarations[0].init as estree.SimpleLiteral);

            expect(actual).to.be.ok;
            expect(actual.nodeID).to.be.eq(originalLiteral.nodeID);
            expect(actual.value).to.be.eq(1);
        });
    });

    describe('Should not mutate', () => {
        it('a RegEx value', () => {
            const program = parser.parse(`const testValue = /[0-9]/;`);
            const variableDeclaration = (program.body[0] as estree.VariableDeclaration);
            
            const actual = <estree.SimpleLiteral>mutator.applyMutations(variableDeclaration, copy);
            const originalLiteral = (variableDeclaration.declarations[0].init as estree.SimpleLiteral);

            expect(actual).to.be.undefined;
        });
        it('a string value', () => {
            const program = parser.parse(`const testValue = 'Some string';`);
            const variableDeclaration = (program.body[0] as estree.VariableDeclaration);
            
            const actual = <estree.SimpleLiteral>mutator.applyMutations(variableDeclaration, copy);
            const originalLiteral = (variableDeclaration.declarations[0].init as estree.SimpleLiteral);

            expect(actual).to.be.undefined;
        });
    });
});