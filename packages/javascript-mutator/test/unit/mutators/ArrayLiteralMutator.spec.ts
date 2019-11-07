import ArrayLiteralMutator from '../../../src/mutators/ArrayLiteralMutator';
import { expectMutation } from '../../helpers/mutatorAssertions';

describe('ArrayLiteralMutator', () => {
  it('should mutate filled array literals as empty arrays', () => {
    expectMutation(new ArrayLiteralMutator(), '[a, 1 + 1]', '[]');
    expectMutation(new ArrayLiteralMutator(), "['val']", '[]');
  });

  it('should not mutate array initializers (leave that for ArrayNewExpressionMutator)', () => {
    expectMutation(new ArrayLiteralMutator(), 'new Array()');
    expectMutation(new ArrayLiteralMutator(), 'new Array(1, 2, 3)');
  });
});
