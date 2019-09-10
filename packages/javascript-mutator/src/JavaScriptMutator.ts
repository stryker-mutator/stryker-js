import * as types from '@babel/types';
import { File, MutatorDescriptor } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { Mutant, Mutator } from '@stryker-mutator/api/mutant';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import BabelHelper from './helpers/BabelHelper';
import copy from './helpers/copy';
import { NODE_MUTATORS_TOKEN, NodeMutator } from './mutators/NodeMutator';

export class JavaScriptMutator implements Mutator {
  public static inject = tokens(commonTokens.logger, commonTokens.mutatorDescriptor, NODE_MUTATORS_TOKEN);
  constructor(
    private readonly log: Logger,
    private readonly mutatorDescriptor: MutatorDescriptor,
    private readonly mutators: ReadonlyArray<NodeMutator>
  ) {
    /*
      Edge case check
      Check if `mutatorDescriptor` has been passed.
      If it is not and `mutators` isn't as well, `mutatorDescriptor` is undefined
      If it is not, but `mutators` is, `mutatorDescriptor` is an array
    */
    if (typeof mutatorDescriptor !== 'object' || Array.isArray(mutatorDescriptor)) {
      this.mutatorDescriptor = {
        babelPlugins: [],
        excludedMutations: [],
        name: ''
      };
    }
  }

  public mutate(inputFiles: File[]): Mutant[] {
    const mutants: Mutant[] = [];
    const babelPlugins = this.mutatorDescriptor.babelPlugins || [];

    inputFiles.forEach(file => {
      const ast = BabelHelper.parse(file.textContent, babelPlugins);

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
