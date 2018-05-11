import { Mutator, MutatorFactory } from 'stryker-api/mutant';
import { Config } from 'stryker-api/config';

const generateMutators = (config: Config): { [name: string]: Mutator; } => {
  const mutators: { [name: string]: Mutator; } = {};
  const factory = MutatorFactory.instance();
  factory.knownNames().forEach(name => {
    if (name !== 'es5' && name !== 'vue') {
      mutators[name] = factory.create(name, config);
    }
  });
  return mutators;
};

export { generateMutators };
