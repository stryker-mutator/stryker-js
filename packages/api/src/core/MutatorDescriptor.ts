interface MutatorDescriptor {
  name: string;
  excludedMutations: string[];
  babelPlugins: (string | object)[];
}

export default MutatorDescriptor;
