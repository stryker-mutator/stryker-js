import { expect } from 'chai';

import { booleanLiteralMutator as sut } from '../../../src/mutators/boolean-literal-mutator.js';
import { expectJSMutation, expectJSMutationWithLevel } from '../../helpers/expect-mutation.js';
import { MutationLevel } from '../../../src/mutation-level/mutation-level.js';

const booleanLiteralLevel: MutationLevel = {
  name: 'BooleanLiteralLevel',
  BooleanLiteral: ['TrueLiteralNegation', 'LogicalNotRemoval'],
};

const booleanLiteralUndefinedLevel: MutationLevel = {
  name: 'BooleanLiteralLevel',
  BooleanLiteral: [],
};

const noLevel = undefined;

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

  describe('mutation level', () => {
    it('should only mutate TrueLiteralNegation, LogicalNotRemoval', () => {
      expectJSMutationWithLevel(
        sut,
        booleanLiteralLevel.BooleanLiteral,
        'if (true) {}; if (false) {}; if (!value) {}',
        'if (false) {}; if (false) {}; if (!value) {}', // TrueLiteralNegation
        'if (true) {}; if (false) {}; if (value) {}', // LogicalNotRemoval
      );
    });

    it('should not perform any ' + sut.name + ' mutations', () => {
      expectJSMutationWithLevel(sut, booleanLiteralUndefinedLevel.BooleanLiteral, 'if (true) {}; if (false) {}; if (!value) {}');
    });

    it('should perform all ' + sut.name + ' mutations', () => {
      expectJSMutationWithLevel(
        sut,
        noLevel,
        'if (true) {}; if (false) {}; if (!value) {}',
        'if (false) {}; if (false) {}; if (!value) {}', // TrueLiteralNegation
        'if (true) {}; if (false) {}; if (value) {}', // LogicalNotRemoval
        'if (true) {}; if (true) {}; if (!value) {}', // FalseLiteralNegation
      );
    });
  });
});
