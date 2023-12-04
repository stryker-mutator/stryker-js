import { expect } from 'chai';

import { booleanLiteralMutator as sut } from '../../../src/mutators/boolean-literal-mutator.js';
import { expectJSMutation, expectJSMutationWithLevel } from '../../helpers/expect-mutation.js';
import { MutationLevel } from '../../../src/mutators/mutation-level-options.js';

const booleanLiteralLevel: MutationLevel = {
  name: 'BooleanLiteralLevel',
  BooleanLiteral: ['TrueToFalse', 'RemoveNegation'],
};

const booleanLiteralAllLevel: MutationLevel = {
  name: 'BooleanLiteralLevel',
  BooleanLiteral: ['TrueToFalse', 'FalseToTrue', 'RemoveNegation'],
};

const booleanLiteralUndefinedLevel: MutationLevel = {
  name: 'BooleanLiteralLevel',
};

describe(sut.name, () => {
  it('should have name "BooleanLiteral"', () => {
    expect(sut.name).eq('BooleanLiteral');
  });

  it('should mutate `true` into `false`', () => {
    expectJSMutation(sut, 'true', 'false');
  });

  it('should mutate `false` into `true`', () => {
    expectJSMutation(sut, 'false', 'true');
  });

  it('should mutate !a to a', () => {
    expectJSMutation(sut, '!a', 'a');
  });

  it('should only mutate what is defined in the mutation level', () => {
    expectJSMutationWithLevel(
      sut,
      booleanLiteralLevel.BooleanLiteral,
      'if (true) {}; if (false) {}; if (!value) {}',
      'if (false) {}; if (false) {}; if (!value) {}',
      'if (true) {}; if (false) {}; if (value) {}',
    );
  });

  it('should not mutate anything if there are no values in the mutation level', () => {
    expectJSMutationWithLevel(sut, [], 'if (true) {}; if (false) {}; if (!value) {}');
  });

  it('should mutate everything if everything is in the mutation level', () => {
    expectJSMutationWithLevel(
      sut,
      booleanLiteralAllLevel.BooleanLiteral,
      'if (true) {}; if (false) {}; if (!value) {}',
      'if (false) {}; if (false) {}; if (!value) {}',
      'if (true) {}; if (false) {}; if (value) {}',
      'if (true) {}; if (true) {}; if (!value) {}',
    );
  });

  it('should mutate everything if the mutation level is undefined', () => {
    expectJSMutationWithLevel(
      sut,
      booleanLiteralUndefinedLevel.BooleanLiteral,
      'if (true) {}; if (false) {}; if (!value) {}',
      'if (false) {}; if (false) {}; if (!value) {}',
      'if (true) {}; if (false) {}; if (value) {}',
      'if (true) {}; if (true) {}; if (!value) {}',
    );
  });
});
