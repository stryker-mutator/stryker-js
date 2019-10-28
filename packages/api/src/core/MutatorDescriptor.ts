interface MutatorDescriptor {
  name: string;
  excludedMutations?: string[];
  excludedExpressions?: string[];
}

export default MutatorDescriptor;
