interface MutatorDescriptor {
  name: string;
  excludedMutations: string[];
  babelPlugins: string[];
}

export default MutatorDescriptor;
