import { Config } from 'stryker-api/config';
import { File } from 'stryker-api/core';
import { Mutant, Mutator, MutatorFactory } from 'stryker-api/mutant';
const compiler = require('vue-template-compiler');

export default class VueMutator implements Mutator {
  private mutators: { [name: string]: Mutator; };

  constructor(private config: Config) { }

  mutate(inputFiles: File[]): Mutant[] {
    this.initializeMutators();
    let mutants: Mutant[] = [];

    inputFiles.forEach(file => {
      if (file.name.endsWith('.vue')) {
        const script = compiler.parseComponent(file.textContent).script;
        const mutator = this.getVueScriptMutator(script);
        const vueFile = new File(
          file.name + '.js', /* TODO: Remove this once all mutators understand that vue files are OK to mutate */
          file.textContent.substring(script.start, script.end)
        );
        const vueMutants = mutator.mutate([vueFile]);
        vueMutants.forEach(mutant => {
          mutant.fileName = file.name; /* TODO: Remove this once all mutators understand that vue files are OK to mutate */
          mutant.range[0] += script.start;
          mutant.range[1] += script.start;
        });
        mutants = mutants.concat(vueMutants);
      } else {
        const mutator = this.getMutator(file);
        mutants = mutants.concat(mutator.mutate([file]));
      }
    });

    return mutants;
  }

  private initializeMutators() {
    this.mutators = {};
    const factory = MutatorFactory.instance();
    factory.knownNames().forEach(name => {
      if (name !== 'es5') {
        this.mutators[name] = factory.create(name, this.config);
      }
    });
  }

  private getVueScriptMutator(script: any): Mutator {
    const lang: string | undefined = script.attrs.lang;
    let mutatorName: string;
    switch (lang) {
      case undefined:
      case 'js':
        mutatorName = 'javascript';
        break;
      case 'ts':
        mutatorName = 'typescript';
        break;
      default:
        throw new Error(`Found unsupported language attribute 'lang="${lang}"' on a <script> block.`);
    }

    let mutator = this.mutators[mutatorName];
    if (mutator === undefined) {
      throw new Error(`The '${mutatorName}' mutator is required to mutate a <script> block but it was not found.`);
    }
    return mutator;
  }

  getMutator(file: File): Mutator {
    let mutator = this.mutators['typescript'] || this.mutators['javascript'];
    if (mutator === undefined) {
      throw new Error(`Unable to mutate file "${file.name}" because neither the typescript or the javascript mutator was installed.`);
    }
    return mutator;
  }
}