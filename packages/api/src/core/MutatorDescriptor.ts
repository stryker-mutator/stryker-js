interface MutatorDescriptor {
  name: string;
  excludedMutations: string[];
  plugins: string[] | null;
}

export default MutatorDescriptor;
