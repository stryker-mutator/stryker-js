import { Mutator, MutatorFactory } from 'stryker-api/mutant';

const generateMutators = (): { [name: string]: Mutator; } => {
  const mutators: { [name: string]: Mutator; } = {};
  const factory = MutatorFactory.instance();
  factory.knownNames().forEach(name => {
    if (name !== 'es5' && name !== 'vue') {
      mutators[name] = factory.create(name, this.config);
    }
  });
  return mutators;
};

export { generateMutators };
