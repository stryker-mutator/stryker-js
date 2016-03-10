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
    var mutants: Mutant[] = [];
    
    var location: ESTree.SourceLocation = {
      start: {
        line: node.test.loc.start.line,
        column: node.test.loc.start.column
      },
      end: {
        line: node.test.loc.end.line,
        column: node.test.loc.end.column
      }
    };
    mutants.push(new Mutant(this, filename, originalCode, 'false', location));
    if (node.type === Syntax.IfStatement) {
      mutants.push(new Mutant(this, filename, originalCode, 'true', location));
    }

    return mutants;
  };

  canMutate(node: ESTree.Node) {
    return !!(node && _.indexOf(this.types, node.type) >= 0);
  };

}
