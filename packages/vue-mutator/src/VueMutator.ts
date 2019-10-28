import { File } from '@stryker-mutator/api/core';
import { Mutant, Mutator } from '@stryker-mutator/api/mutant';
import { tokens } from '@stryker-mutator/api/plugin';
import { MUTATORS_TOKEN } from './helpers/MutatorHelpers';
const compiler = require('vue-template-compiler');

export default class VueMutator implements Mutator {
  private readonly javascriptMutatorName = 'javascript';
  private readonly typescriptMutatorName = 'typescript';

  constructor(private readonly mutators: { [name: string]: Mutator }) {}
  public static inject = tokens(MUTATORS_TOKEN);

  public mutate(inputFiles: File[]): Mutant[] {
    const mutants: Mutant[] = [];

    inputFiles.forEach(file => {
      if (file.name.endsWith('.vue')) {
        const script = compiler.parseComponent(file.textContent).script;
        if (script) {
          // Vue file must have <script></script> tag to be mutated
          const { mutator, extension } = this.getVueScriptMutatorAndExtension(script);
          const vueFile = new File(file.name + extension, file.textContent.substring(script.start, script.end));
          const vueMutants = mutator.mutate([vueFile]);
          vueMutants.forEach(mutant => {
            mutant.fileName = file.name;
            mutant.range[0] += script.start;
            mutant.range[1] += script.start;
          });
          mutants.push(...vueMutants);
        }
      } else {
        const mutator = this.getMutator(file);
        mutants.push(...mutator.mutate([file]));
      }
    });

    return mutants;
  }

  private getVueScriptMutatorAndExtension(script: any): { mutator: Mutator; extension: string } {
    const lang: string | undefined = script.attrs.lang;
    let mutatorName: string;
    let extension: string;
    switch (lang) {
      case undefined:
      case 'js':
      case 'javascript':
        mutatorName = this.javascriptMutatorName;
        extension = '.js';
        break;
      case 'ts':
      case 'typescript':
        mutatorName = this.typescriptMutatorName;
        extension = '.ts';
        break;
      default:
        throw new Error(`Found unsupported language attribute 'lang="${lang}"' on a <script> block.`);
    }

    const mutator = this.mutators[mutatorName];
    if (mutator === undefined) {
      throw new Error(
        `The '${mutatorName}' mutator is required to mutate a <script> block but it was not found. Please read the README of this package for information on configuration.`
      );
    }
    return { mutator, extension };
  }

  private getMutator(file: File): Mutator {
    const mutator = this.mutators[this.typescriptMutatorName] || this.mutators[this.javascriptMutatorName];
    if (mutator === undefined) {
      throw new Error(
        `Unable to mutate file "${file.name}" because neither the typescript or the javascript mutator was installed. Please read the README of this package for information on configuration.`
      );
    }
    return mutator;
  }
}
