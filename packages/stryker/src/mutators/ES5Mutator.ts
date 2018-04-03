import * as _ from 'lodash';
import { Logger, getLogger } from 'log4js';
import { Config } from 'stryker-api/config';
import { File } from 'stryker-api/core';
import { Mutator, Mutant } from 'stryker-api/mutant';
import * as parserUtils from '../utils/parserUtils';
import { copy } from '../utils/objectUtils';
import NodeMutator from './NodeMutator';
import BinaryOperatorMutator from './BinaryOperatorMutator';
import BlockStatementMutator from './BlockStatementMutator';
import LogicalOperatorMutator from './LogicalOperatorMutator';
import RemoveConditionalsMutator from './RemoveConditionalsMutator';
import UnaryOperatorMutator from './UnaryOperatorMutator';
import UpdateOperatorMutator from './UpdateOperatorMutator';
import ArrayDeclaratorMutator from './ArrayDeclaratorMutator';
import BooleanSubstitutionMutator from './BooleanSubstitutionMutator';

export default class ES5Mutator implements Mutator {

  private readonly log: Logger;

  constructor(_?: Config, private mutators: NodeMutator[] = [
    new BinaryOperatorMutator(),
    new BlockStatementMutator(),
    new LogicalOperatorMutator(),
    new RemoveConditionalsMutator(),
    new UnaryOperatorMutator(),
    new UpdateOperatorMutator(),
    new ArrayDeclaratorMutator(),
    new BooleanSubstitutionMutator()
  ]) {
    this.log = getLogger(ES5Mutator.name);
    this.log.warn(`DEPRECATED: The es5 mutator is deprecated and will be removed in the future. Please upgrade to the stryker-javascript-mutator (npm install --save-dev stryker-javascript-mutator) and set "mutator: 'javascript'" in your stryker.conf.js! If you have a plugins array in your stryker.conf.js, be sure to add 'stryker-javascript-mutator'.`);
  }


  mutate(files: File[]): Mutant[] {
    return _.flatMap(files, file => this.mutateForFile(file));
  }

  private mutateForFile(file: File): Mutant[] {
    const abstractSyntaxTree = parserUtils.parse(file.textContent);
    const nodes = new parserUtils.NodeIdentifier().identifyAndFreeze(abstractSyntaxTree);
    return this.mutateForNodes(file, nodes);
  }

  private mutateForNodes(file: File, nodes: any[]): Mutant[] {
    return _.flatMap(nodes, astNode => {
      if (astNode.type) {
        Object.freeze(astNode);
        return _.flatMap(this.mutators, mutator => {
          try {
            let mutatedNodes = mutator.applyMutations(astNode, copy);
            if (mutatedNodes) {
              if (!Array.isArray(mutatedNodes)) {
                mutatedNodes = [mutatedNodes];
              }
              if (mutatedNodes.length > 0) {
                this.log.debug(`The mutator '${mutator.name}' mutated ${mutatedNodes.length} node${mutatedNodes.length > 1 ? 's' : ''} between (Ln ${astNode.loc.start.line}, Col ${astNode.loc.start.column}) and (Ln ${astNode.loc.end.line}, Col ${astNode.loc.end.column}) in file ${file.name}`);
              }
              return mutatedNodes.map(mutatedNode => {
                const replacement = parserUtils.generate(mutatedNode);
                const originalNode = nodes[mutatedNode.nodeID];
                const mutant: Mutant = { mutatorName: mutator.name, fileName: file.name, replacement, range: originalNode.range };
                return mutant;
              });
            } else {
              return [];
            }
          } catch (error) {
            throw new Error(`The mutator named '${mutator.name}' caused an error: ${error}`);
          }
        });
      } else {
        return [];
      }
    });
  }

}
