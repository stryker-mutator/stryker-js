import {Mutator} from './api/mutant';
// import ConditionalBoundaryMutation from './mutations/ConditionalBoundaryMutation';
// import MathMutation from './mutations/MathMutation';
import RemoveConditionalsMutator from './mutators/RemoveConditionalsMutator';
// import ReverseConditionalMutation from './mutations/ReverseConditionalMutation';
// import UnaryOperatorMutation from './mutations/UnaryOperatorMutation';


export default class MutatorRegistry {
  public static mutators: Mutator[] = [
      // new ConditionalBoundaryMutation(),
      // new MathMutation(),
      new RemoveConditionalsMutator(),
      // new ReverseConditionalMutation(),
      // new UnaryOperatorMutation()
    ];
}