import * as types from '@babel/types';
import { Logger } from '@stryker-mutator/api/logging';
import { Mutator, Mutant } from '@stryker-mutator/api/mutant';
import { File } from '@stryker-mutator/api/core';
import copy from './helpers/copy';
import { NodeMutator, NODE_MUTATORS_TOKEN } from './mutators/NodeMutator';
import BabelHelper from './helpers/BabelHelper';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';

export class JavaScriptMutator implements Mutator {
  private readonly mutators: ReadonlyArray<NodeMutator>;
  private readonly mutatorsSwitch: { [key: string]: boolean };

  public static inject = tokens(commonTokens.logger, NODE_MUTATORS_TOKEN) ;
  constructor(private readonly log: Logger, mutators: ReadonlyArray<NodeMutator>) {
    this.mutators = mutators;
    this.mutatorsSwitch = {};
    mutators.forEach(mutator => {
      this.mutatorsSwitch[mutator.name] = true;
    });
  }

  private parseSwitchers(data: string) {
    return data.substr(data.indexOf(' ') + 1).split(',').map(el => el.trim());
  }

  private updateMutators(data: string[], newValue: boolean) {
    if (data[0].startsWith('stryker:')) {
      data.shift();
    }
    if (data.length === 0) {
      Object.keys(this.mutatorsSwitch).forEach(mutator => {
        this.mutatorsSwitch[mutator] = newValue;
      });
    } else {
      data.forEach(mutator => {
        if (this.mutatorsSwitch[mutator] === !newValue) {
          this.mutatorsSwitch[mutator] = newValue;
        }
      });
    }
  }

  private mutatorsSwitcher(comments: ReadonlyArray<types.Comment>) {
    comments.map(comment => {
      const trim = comment.value.trim();
      switch (trim.split(' ', 1)[0]) {
        case 'stryker:on':
          this.updateMutators(this.parseSwitchers(trim), true);
          break;
        case 'stryker:off':
          this.updateMutators(this.parseSwitchers(trim), false);
          break;
      }
    });
  }

  public mutate(inputFiles: File[]): Mutant[] {
    const mutants: Mutant[] = [];

    inputFiles.forEach(file => {
      const ast = BabelHelper.parse(file.textContent);

      BabelHelper.getNodes(ast).forEach(node => {
        this.mutatorsSwitcher(node.leadingComments || []);

        this.mutators.forEach(mutator => {
          if (this.mutatorsSwitch[mutator.name] === true) {
            const mutatedNodes = mutator.mutate(node, copy);

            if (mutatedNodes.length > 0) {
              const newMutants = this.generateMutants(mutatedNodes, mutator.name, file.name);
              mutants.push(...newMutants);
            }
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
