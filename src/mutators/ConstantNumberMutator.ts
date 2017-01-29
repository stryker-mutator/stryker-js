import { Syntax } from 'esprima';
import { Mutator } from 'stryker-api/mutant';
import * as estree from 'estree';

/**
 * Represents a mutator which can remove the content of a BlockStatement.
 */
export default class ConstantNumberMutator implements Mutator {
    name = 'ConstantNumber';

    constructor() { }

    applyMutations(node: estree.Node, copy: <T>(obj: T, deep?: boolean) => T): void | estree.Node | estree.Node[] {
        if (node.type === Syntax.VariableDeclaration && node.kind === 'const' && node.declarations.length === 1) {
            let declaration = node.declarations[0];
            if (declaration.init.type === Syntax.Literal) {
                let mutatedNode: estree.SimpleLiteral | estree.RegExpLiteral = copy(declaration.init);
                if (typeof(mutatedNode.value) === 'number') {
                    mutatedNode.value = mutatedNode.value === 0 ? 1 : 0;
                    return mutatedNode;
                }
            }
        }
    }
}
