import * as babel from 'babel-core';
import { getLogger } from 'log4js';
import { Mutator, Mutant } from 'stryker-api/mutant';
import { File, FileKind, TextFile } from 'stryker-api/core';
import { Config } from 'stryker-api/config';
import BabelParser from './helpers/BabelParser';
import copy from './helpers/copy';
import NodeMutatorFactory from './NodeMutatorFactory';
import NodeMutator from './mutators/NodeMutator';
import * as path from 'path';

function defaultMutators(): NodeMutator[] {
  return NodeMutatorFactory.instance().knownNames().map(name => NodeMutatorFactory.instance().create(name, undefined));
}

export default class JavaScriptMutator implements Mutator {
  private log = getLogger(JavaScriptMutator.name);
  private knownExtensions: Array<string> = ['.js', '.jsx'];

  constructor(config: Config, private mutators: NodeMutator[] = defaultMutators()) {
  }

  public mutate(inputFiles: File[]): Mutant[] {
    const mutants: Mutant[] = [];

    inputFiles.filter(i => i.kind === FileKind.Text && i.mutated && this.hasValidExtension(i)).forEach((file: TextFile) => {
      const ast = BabelParser.getAst(file.content);
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

  private hasValidExtension(file: TextFile): boolean {
    for (let extension of this.knownExtensions) {
      if (path.extname(file.name) === extension) {
        return true;
      }
    }
    
    return false;
  }

  private generateMutants(nodes: babel.types.Node[], ast: babel.types.File, file: TextFile, mutatorName: string) {
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