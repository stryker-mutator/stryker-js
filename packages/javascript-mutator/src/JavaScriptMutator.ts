import * as types from '@babel/types';
import { Mutant, File } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { Mutator } from '@stryker-mutator/api/mutant';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';

import BabelParser from './helpers/BabelParser';
import { NodeMutator } from './mutators/NodeMutator';
import { NODE_MUTATORS_TOKEN, PARSER_TOKEN } from './helpers/tokens';

export class JavaScriptMutator implements Mutator {
  public static inject = tokens(commonTokens.logger, NODE_MUTATORS_TOKEN, PARSER_TOKEN);
  constructor(private readonly log: Logger, private readonly mutators: readonly NodeMutator[], private readonly parser: BabelParser) {}

  public mutate(inputFiles: File[]): Mutant[] {
    const mutants: Mutant[] = [];

    inputFiles.forEach((file) => {
      const ast = this.parser.parse(file.textContent);

      this.parser.getNodes(ast).forEach((node) => {
        this.mutators.forEach((mutator) => {
          const fileName = file.name;
          const mutatorName = mutator.name;

          mutator.mutate(node).forEach(([original, mutation]) => {
            if (original.start !== null && original.end !== null) {
              const replacement = types.isNode(mutation) ? this.parser.generateCode(mutation) : mutation.raw;

              mutants.push({
                id: 42, // TODO this code will be removed in #1514. Temp fill it with a string.
                fileName: fileName,
                mutatorName: mutatorName,
                range: [original.start, original.end],
                replacement,
              });

              this.log.trace(`Generated mutant for mutator ${mutatorName} in file ${fileName} with replacement code "${replacement}"`);
            }
          });
        });
      });
    });

    return mutants;
  }
}
