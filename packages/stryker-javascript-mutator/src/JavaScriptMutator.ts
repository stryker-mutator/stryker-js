import * as babel from 'babel-core';
import { getLogger, setGlobalLogLevel } from 'log4js';
import { Mutator, Mutant } from 'stryker-api/mutant';
import { File } from 'stryker-api/core';
import { Config } from 'stryker-api/config';
import BabelParser from './helpers/BabelParser';
import copy from './helpers/copy';
import NodeMutatorFactory from './NodeMutatorFactory';
import NodeMutator from './mutators/NodeMutator';

function defaultMutators(): NodeMutator[] {
  return NodeMutatorFactory.instance().knownNames().map(name => NodeMutatorFactory.instance().create(name, undefined));
}

export default class JavaScriptMutator implements Mutator {
  private log = getLogger(JavaScriptMutator.name);

  constructor(config: Config, private mutators: NodeMutator[] = defaultMutators()) {
    setGlobalLogLevel(config.logLevel);
  }

  public mutate(inputFiles: File[]): Mutant[] {
    const mutants: Mutant[] = [];

    inputFiles.forEach(file => {
      const ast = BabelParser.getAst(file.textContent);
      const baseAst = copy(ast, true);
      BabelParser.removeUseStrict(baseAst);

      BabelParser.getNodes(ast).forEach(node => {
        this.mutators.forEach(mutator => {
          let mutatedNodes = mutator.mutate(node, copy);

          if (mutatedNodes) {
            const newMutants = this.generateMutants(mutatedNodes, baseAst, file, mutator.name);
            newMutants.forEach(mutant => mutants.push(mutant));
          }
        });
      });
    });

    return mutants;
  }

  private generateMutants(nodes: babel.types.Node[], ast: babel.types.File, file: File, mutatorName: string) {
    const mutants: Mutant[] = [];

    nodes.forEach(node => {
      const replacement = BabelParser.generateCode(ast, node);
      if (replacement) {
        const range: [number, number] = [node.start, node.end];

        const mutant = {
          mutatorName,
          fileName: file.name,
          range,
          replacement
        };
        this.log.trace(`Generated mutant for mutator ${mutatorName} in file ${file.name} with replacement code "${replacement}"`);
        mutants.push(mutant);
      }
    });

    return mutants;
  }
}