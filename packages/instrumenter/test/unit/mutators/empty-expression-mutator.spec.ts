import { expect } from 'chai';
import babel from '@babel/core';

import type { Mutable } from '../../../src/mutant.js';
import { emptyExpressionMutator } from '../../../src/mutators/empty-expression-mutator.js';
import { expectJSMutation } from '../../helpers/expect-mutation.js';

const { types } = babel;

function createMutantsInScope(count: number): Mutable[] {
  return Array.from({ length: count }, () => ({
    mutatorName: 'CallExpression',
    replacement: types.identifier('x'),
  }));
}

describe(emptyExpressionMutator.name, () => {
  describe('filter', () => {
    it('should only keep scopes with exactly one mutant', () => {
      const { filter } = emptyExpressionMutator;

      if (!filter) {
        expect.fail('Expected filter to be defined');
      }

      expect(filter([])).to.be.false;
      expect(filter(createMutantsInScope(1))).to.be.true;
      expect(filter(createMutantsInScope(2))).to.be.false;
    });
  });

  describe('outside svelte template context', () => {
    it('should have name "CallExpression"', () => {
      expect(emptyExpressionMutator.name).eq('CallExpression');
    });

    it('should mutate a call expression statement to an empty statement', () => {
      expectJSMutation(
        emptyExpressionMutator,
        'foo();',
        { isExpressionContext: false },
        ';',
      );
    });

    it('should not mutate a super call expression statement', () => {
      expectJSMutation(
        emptyExpressionMutator,
        'class Child extends Parent { constructor(){ super(); } }',
        { isExpressionContext: false },
      );
    });

    it('should mutate throw new expressions to an empty statement', () => {
      expectJSMutation(
        emptyExpressionMutator,
        'function f(){throw new Error();}',
        { isExpressionContext: false },
        'function f(){;}',
      );
    });

    it('should not mutate throw statements with a non-new expression argument', () => {
      expectJSMutation(emptyExpressionMutator, 'function f(){throw error;}', {
        isExpressionContext: false,
      });
    });
  });

  describe('inside svelte template context', () => {
    it('should mutate a template root call expression into void 0', () => {
      expectJSMutation(
        emptyExpressionMutator,
        'foo();',
        { isExpressionContext: true },
        'void 0;',
      );
    });

    it('should not mutate a template root super call expression', () => {
      expectJSMutation(
        emptyExpressionMutator,
        'class Child extends Parent { constructor(){ super(); } }',
        { isExpressionContext: true },
      );
    });
  });
});
