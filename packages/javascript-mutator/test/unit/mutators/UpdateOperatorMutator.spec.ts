import UpdateOperatorMutator from '../../../src/mutators/UpdateOperatorMutator';
import { expectMutation } from '../../helpers/mutatorAssertions';

describe(UpdateOperatorMutator.name, () => {
  it('should mutate a++ to a--', () => {
    expectMutation(new UpdateOperatorMutator(), 'a++', 'a--');
  });

  it('should mutate a-- to a++', () => {
    expectMutation(new UpdateOperatorMutator(), 'a--', 'a++');
  });

  it('should mutate ++a to --a', () => {
    expectMutation(new UpdateOperatorMutator(), '++a', '--a');
  });

  it('should mutate --a to ++a', () => {
    expectMutation(new UpdateOperatorMutator(), '--a', '++a');
  });
});
