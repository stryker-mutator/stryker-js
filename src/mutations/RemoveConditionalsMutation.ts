'use strict';

import * as _ from 'lodash';
import {Syntax} from 'esprima';
import BaseMutation from './BaseMutation';
import Mutant from '../Mutant';

/**
 * Represents a mutation which can remove the conditional clause from statements.
 * @class
 */
export default class RemoveConditionalsMutation extends BaseMutation {
  constructor() {
    super('RemoveConditionals', [Syntax.DoWhileStatement, Syntax.IfStatement, Syntax.ForStatement, Syntax.WhileStatement]);
  }

  applyMutation(filename: string, originalCode: string, node: ESTree.IfStatement| ESTree.DoWhileStatement| ESTree.WhileStatement| ESTree.ForStatement, ast: ESTree.Program) {
    var originalTest = node.test;

    var mutants: Mutant[] = [];
    node.test = <ESTree.Literal>{
      type: Syntax.Literal,
      value: false,
      raw: 'false'
    };
    mutants.push(new Mutant(filename, originalCode, this, ast, node, node.loc.start.column));
    if (node.type === Syntax.IfStatement) {
      (<ESTree.Literal>node.test).value = true;
      (<ESTree.Literal>node.test).raw = (<ESTree.Literal>node.test).value.toString();
      mutants.push(new Mutant(filename, originalCode, this, ast, node, node.loc.start.column));
    }

    node.test = originalTest;

    return mutants;
  };

  canMutate(node: ESTree.Node) {
    return !!(node && _.indexOf(this.types, node.type) >= 0);
  };

}
