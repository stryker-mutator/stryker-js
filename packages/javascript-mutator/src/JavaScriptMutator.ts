import * as types from '@babel/types';
import { Logger } from '@stryker-mutator/api/logging';
import { Mutator, Mutant } from '@stryker-mutator/api/mutant';
import { File } from '@stryker-mutator/api/core';
import copy from './helpers/copy';
import { NodeMutator, NODE_MUTATORS_TOKEN } from './mutators/NodeMutator';
import BabelHelper from './helpers/BabelHelper';
import { tokens, COMMON_TOKENS } from '@stryker-mutator/api/plugin';

export class JavaScriptMutator implements Mutator {

  public static inject = tokens(COMMON_TOKENS.logger, NODE_MUTATORS_TOKEN) ;
  constructor(
    private readonly log: Logger,
    private readonly mutators: ReadonlyArray<NodeMutator>
    ) { }

  public mutate(inputFiles: File[]): Mutant[] {
    const mutants: Mutant[] = [];

    inputFiles.forEach(file => {
      const ast = BabelHelper.parse(file.textContent);

      BabelHelper.getNodes(ast).forEach(node => {
        this.mutators.forEach(mutator => {
          const mutatedNodes = mutator.mutate(node, copy);

          if (mutatedNodes) {
            const newMutants = this.generateMutants(mutatedNodes, mutator.name, file.name);
            mutants.push(...newMutants);
          }
        });
      });
    });

    return mutants;
  }

  private generateMutants(mutatedNodes: types.Node[], mutatorName: string, fileName: string): Mutant[] {
    const mutants: Mutant[] = [];
    mutatedNodes.forEach(node => {
      const replacement = BabelHelper.generateCode(node);
      if (node.start !== null && node.end !== null) {
        const range: [number, number] = [node.start, node.end];
        const mutant: Mutant = {
          fileName,
          mutatorName,
          range,
          replacement
        };
        this.log.trace(`Generated mutant for mutator ${mutatorName} in file ${fileName} with replacement code "${replacement}"`);
        mutants.push(mutant);
      }
    });
    return mutants;
  }
}
