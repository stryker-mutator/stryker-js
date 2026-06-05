import { expect } from 'chai';
import babel from '@babel/core';

import type { Mutable } from '../../../src/mutant.js';
import { EmptyExpressionMutator } from '../../../src/mutators/empty-expression-mutator.js';
import { expectJSMutation } from '../../helpers/expect-mutation.js';
import sinon from 'sinon';
import { SvelteTemplateExpressionContext } from '../../../src/frameworks/svelte-template-expression-context.js';

const { types } = babel;

function createMutantsInScope(count: number): Mutable[] {
  return Array.from({ length: count }, () => ({
    mutatorName: 'CallExpression',
    replacement: types.identifier('x'),
  }));
}

describe(EmptyExpressionMutator.name, () => {
  let svelteTemplateExpressionContextStub: sinon.SinonStubbedInstance<SvelteTemplateExpressionContext>;
  let sut: EmptyExpressionMutator;

  beforeEach(() => {
    svelteTemplateExpressionContextStub = sinon.createStubInstance(
      SvelteTemplateExpressionContext,
    );
    svelteTemplateExpressionContextStub.isTemplateExpressionContext.returns(
      false,
    );
    svelteTemplateExpressionContextStub.isTemplateExpressionRoot.returns(false);
    sut = new EmptyExpressionMutator(svelteTemplateExpressionContextStub);
  });

  describe('filter', () => {
    it('should only keep scopes with exactly one mutant', () => {
      const { filter } = sut;

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
      expect(sut.name).eq('CallExpression');
    });

    it('should mutate a call expression statement to an empty statement', () => {
      expectJSMutation(sut, 'foo();', ';');
    });

    it('should not mutate a super call expression statement', () => {
      expectJSMutation(
        sut,
        'class Child extends Parent { constructor(){ super(); } }',
      );
    });

    it('should mutate throw new expressions to an empty statement', () => {
      expectJSMutation(
        sut,
        'function f(){throw new Error();}',
        'function f(){;}',
      );
    });

    it('should not mutate throw statements with a non-new expression argument', () => {
      expectJSMutation(sut, 'function f(){throw error;}');
    });
  });

  describe('inside svelte template context', () => {
    it('should mutate a template root call expression into void 0', () => {
      svelteTemplateExpressionContextStub.isTemplateExpressionRoot.returns(
        true,
      );
      svelteTemplateExpressionContextStub.isTemplateExpressionContext.returns(
        true,
      );

      expectJSMutation(sut, 'foo();', 'void 0;');
    });

    it('should not mutate a template root super call expression', () => {
      svelteTemplateExpressionContextStub.isTemplateExpressionRoot.returns(
        true,
      );
      svelteTemplateExpressionContextStub.isTemplateExpressionContext.returns(
        true,
      );

      expectJSMutation(
        sut,
        'class Child extends Parent { constructor(){ super(); } }',
      );
    });

    it('should not mutate non-root statements in template context', () => {
      svelteTemplateExpressionContextStub.isTemplateExpressionRoot.returns(
        false,
      );
      svelteTemplateExpressionContextStub.isTemplateExpressionContext.returns(
        true,
      );

      expectJSMutation(sut, 'foo();');
      expectJSMutation(sut, 'function f(){throw new Error();}');
    });
  });
});
