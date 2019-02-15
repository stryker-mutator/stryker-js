import PostfixUnaryExpressionMutator from '../../../src/mutators/PostfixUnaryExpressionMutator';
import { expectMutation } from '../../helpers/mutatorAssertions';

describe('PostfixUnaryExpressionMutator', () => {
  it('should mutate a++ to a--', () => {
    expectMutation(new PostfixUnaryExpressionMutator(), 'a++', 'a--');
  });

  it('should mutate a-- to a++', () => {
    expectMutation(new PostfixUnaryExpressionMutator(), 'a--', 'a++');
  });

  it('should not mutate ++a to --a', () => {
    expectMutation(new PostfixUnaryExpressionMutator(), '++a');
  });

  it('should not mutate --a to ++a', () => {
    expectMutation(new PostfixUnaryExpressionMutator(), '--a');
  });
});
