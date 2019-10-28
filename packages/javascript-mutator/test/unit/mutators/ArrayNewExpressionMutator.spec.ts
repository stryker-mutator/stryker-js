import ArrayNewExpressionMutator from '../../../src/mutators/ArrayNewExpressionMutator';
import { expectMutation } from '../../helpers/mutatorAssertions';

describe('ArrayNewExpressionMutator', () => {
  it('should mutate filled array literals as empty arrays', () => {
    expectMutation(new ArrayNewExpressionMutator(), 'new Array(a, 1 + 1)', 'new Array()');
    expectMutation(new ArrayNewExpressionMutator(), "new Array('val')", 'new Array()');
  });

  it('should not mutate array literals (leave that for ArrayLiteralMutator)', () => {
    expectMutation(new ArrayNewExpressionMutator(), '[]');
    expectMutation(new ArrayNewExpressionMutator(), '[1, 2 ,3]');
  });

  it('should not mutate other new expressions', () => {
    expectMutation(new ArrayNewExpressionMutator(), 'new Object(21, 2)');
    expectMutation(new ArrayNewExpressionMutator(), 'new Arrays(21, 2)');
  });
});
