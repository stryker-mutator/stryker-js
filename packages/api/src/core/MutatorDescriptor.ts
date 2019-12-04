interface MutatorDescriptor {
  name: string;
  excludedMutations: string[];
  excludedExpressions: string[];
  plugins: string[] | null;
}

export default MutatorDescriptor;
