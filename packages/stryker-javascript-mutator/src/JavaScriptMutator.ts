import * as types from '@babel/types';
import { Config } from 'stryker-api/config';
import { File } from 'stryker-api/core';
import { getLogger } from 'stryker-api/logging';
import { Mutant, Mutator } from 'stryker-api/mutant';
import BabelHelper from './helpers/BabelHelper';
import copy from './helpers/copy';
import NodeMutator from './mutators/NodeMutator';
import NodeMutatorFactory from './NodeMutatorFactory';

function defaultMutators(): NodeMutator[] {
  return NodeMutatorFactory.instance().knownNames().map(name => NodeMutatorFactory.instance().create(name, undefined));
}

export default class JavaScriptMutator implements Mutator {
  private readonly log = getLogger(JavaScriptMutator.name);

  constructor(_: Config, private readonly mutators: NodeMutator[] = defaultMutators()) { }

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
