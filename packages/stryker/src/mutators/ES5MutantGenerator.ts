import * as _ from 'lodash';
import { Logger, getLogger } from 'log4js';
import { Config } from 'stryker-api/config';
import { File, TextFile } from 'stryker-api/core';
import { MutantGenerator, Mutant } from 'stryker-api/mutant';
import * as parserUtils from '../utils/parserUtils';
import { copy } from '../utils/objectUtils';
import Mutator from './Mutator';
import BinaryOperatorMutator from './BinaryOperatorMutator';
import BlockStatementMutator from './BlockStatementMutator';
import LogicalOperatorMutator from './LogicalOperatorMutator';
import RemoveConditionalsMutator from './RemoveConditionalsMutator';
import UnaryOperatorMutator from './UnaryOperatorMutator';
import UpdateOperatorMutator from './UpdateOperatorMutator';
import ArrayDeclaratorMutator from './ArrayDeclaratorMutator';
import BooleanSubstitutionMutator from './BooleanSubstitutionMutator';


export default class ES5MutantGenerator implements MutantGenerator {

  private readonly log: Logger;

  constructor(_?: Config, private mutators: Mutator[] = [
    new BinaryOperatorMutator(),
    new BlockStatementMutator(),
    new LogicalOperatorMutator(),
    new RemoveConditionalsMutator(),
    new UnaryOperatorMutator(),
    new UpdateOperatorMutator(),
    new ArrayDeclaratorMutator(),
    new BooleanSubstitutionMutator()
  ]) {
    this.log = getLogger(ES5MutantGenerator.name);
  }


  generateMutants(files: File[]): Mutant[] {
    return _.flatMap(files, file => {
      if (file.mutated && typeof file.content === 'string') {
        return this.generateMutantsForFile(file as TextFile);
      } else {
        return [];
      }
    });
  }

  private generateMutantsForFile(file: TextFile): Mutant[] {
    const abstractSyntaxTree = parserUtils.parse(file.content);
    const nodes = new parserUtils.NodeIdentifier().identifyAndFreeze(abstractSyntaxTree);
    return this.generateMutantsForNodes(file, nodes);
  }

  private generateMutantsForNodes(sourceFile: TextFile, nodes: any[]): Mutant[] {
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
                this.log.debug(`The mutator '${mutator.name}' mutated ${mutatedNodes.length} node${mutatedNodes.length > 1 ? 's' : ''} between (Ln ${astNode.loc.start.line}, Col ${astNode.loc.start.column}) and (Ln ${astNode.loc.end.line}, Col ${astNode.loc.end.column}) in file ${sourceFile.name}`);
              }
              return mutatedNodes.map(mutatedNode => {
                const replacement = parserUtils.generate(mutatedNode);
                const originalNode = nodes[mutatedNode.nodeID];
                const mutant: Mutant = { mutatorName: mutator.name, fileName: sourceFile.name, replacement, range: originalNode.range };
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