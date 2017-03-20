import { IdentifiedNode } from 'stryker-api/mutant';
import {Mutator, MutatorFactory} from 'stryker-api/mutant';


class MyMutator implements Mutator {
  public name = 'myMutator';

  applyMutations(node: IdentifiedNode, copy: (obj: any, deep?: boolean) => any): IdentifiedNode[] {
    return null;
  }
}

MutatorFactory.instance().register('myMutator', MyMutator);
let myMutator = MutatorFactory.instance().create('myMutator', null);
if (!(myMutator instanceof MyMutator)) {
  throw Error('Something wrong with myMutator');
}

let node: IdentifiedNode = { nodeID: 3, type: 'Literal', value: null, raw: '' };
console.log(node);