import {Mutator} from './api/mutant';
import ConditionalBoundaryMutator from './mutators/ConditionalBoundaryMutator';
import MathMutator from './mutators/MathMutator';
import RemoveConditionalsMutator from './mutators/RemoveConditionalsMutator';
import ReverseConditionalMutator from './mutators/ReverseConditionalMutator';
import UnaryOperatorMutator from './mutators/UnaryOperatorMutator';


export default class MutatorRegistry {
  public static mutators: Mutator[] = [
      new ConditionalBoundaryMutator(),
      new MathMutator(),
      new RemoveConditionalsMutator(),
      new ReverseConditionalMutator(),
      new UnaryOperatorMutator()
    ];
}