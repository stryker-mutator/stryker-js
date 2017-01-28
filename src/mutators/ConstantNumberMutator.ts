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
            let mutatedNode = copy(node, true);
            let dec = mutatedNode.declarations[0];
            if (dec.init.type === Syntax.Literal) {
                let init: estree.SimpleLiteral | estree.RegExpLiteral = dec.init;
                if (typeof(init.value) === 'number') {
                    if (init.value === 0) {
                        init.value = 1;
                    } else {
                        init.value = 0;
                    }
                    return mutatedNode;
                }
            }
        }
    }
}
