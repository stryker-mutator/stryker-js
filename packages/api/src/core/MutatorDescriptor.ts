import { ParserPlugin } from '@babel/parser';

interface MutatorDescriptor {
  name: string;
  excludedMutations: string[];
  babelPlugins?: ParserPlugin[];
}

export default MutatorDescriptor;
