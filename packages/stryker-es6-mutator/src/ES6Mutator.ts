import * as babel from 'babel-core';
import { getLogger } from 'log4js';
import { Mutator, Mutant } from 'stryker-api/mutant';
import { File, FileKind, TextFile } from 'stryker-api/core';
import BabelParser from './helpers/BabelParser';
import Copy from './helpers/Copy';
import NodeMutatorFactory from './NodeMutatorFactory';

export default class ES6Mutator implements Mutator {
  private log = getLogger(ES6Mutator.name);

  mutate(inputFiles: File[]): Mutant[] {
    let mutants: Mutant[] = [];
    const factory = NodeMutatorFactory.instance();
    const mutators = factory.knownNames().map(name => factory.create(name, undefined));

    inputFiles.filter(i => i.kind === FileKind.Text && i.mutated).forEach((file: TextFile) => {
      const ast = BabelParser.getAst(file.content);
      const baseAst = Copy(ast, true);
      BabelParser.removeUseStrict(baseAst);

      BabelParser.getNodes(ast).forEach(node => {
        mutators.forEach(mutator => {
          let mutatedNodes = mutator.mutate(node, Copy);

          if (mutatedNodes) {
            const newMutants = this.generateMutants(mutatedNodes, baseAst, file, mutator.name);
            mutants = mutants.concat(newMutants);
          }
        });
      });
    });

    return mutants;
  }

  private generateMutants(nodes: babel.types.Node[], ast: babel.types.File, file: TextFile, mutatorName: string) {
    const mutants: Mutant[] = [];

    nodes.forEach(node => {
      const replacement =  BabelParser.generateCode(ast, node);
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