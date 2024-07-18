import { expect } from 'chai';

import { objectLiteralMutator as sut } from '../../../src/mutators/object-literal-mutator.js';
import { expectJSMutation, expectJSMutationWithLevel } from '../../helpers/expect-mutation.js';
import { MutationLevel } from '../../../src/mutation-level/mutation-level.js';

const objectLiteralLevel: MutationLevel = { name: 'ObjectLiteralLevel', ObjectLiteral: ['ObjectLiteralPropertiesRemoval'] };
const objectLiteralUndefinedLevel: MutationLevel = { name: 'ObjectLiteralLevel', ObjectLiteral: [] };
const noLevel = undefined;

describe(sut.name, () => {
  it('should have name "ObjectLiteral"', () => {
    expect(sut.name).eq('ObjectLiteral');
  });

  it('should empty an object declaration', () => {
    expectJSMutation(sut, 'const o = { foo: "bar" }', 'const o = {}');
  });

  it('should empty an object declaration of all properties', () => {
    expectJSMutation(sut, 'const o = { foo: "bar", baz: "qux" }', 'const o = {}');
  });

  it('should empty string object keys', () => {
    expectJSMutation(sut, 'const o = { ["foo"]: "bar" }', 'const o = {}');
  });

  it('shoud not mutate empty object declarations', () => {
    expectJSMutation(sut, 'const o = {}');
  });

  describe('mutation level', () => {
    it('should remove object literal', () => {
      expectJSMutationWithLevel(sut, objectLiteralLevel.ObjectLiteral, 'const o = { ["foo"]: "bar" }', 'const o = {}');
    });

    it('should not perform any ' + sut.name + ' mutations', () => {
      expectJSMutationWithLevel(sut, objectLiteralUndefinedLevel.ObjectLiteral, "{ foo: 'bar' }");
    });

    it('should perform all ' + sut.name + ' mutations', () => {
      expectJSMutationWithLevel(sut, noLevel, 'const o = { ["foo"]: "bar" }', 'const o = {}');
    });
  });
});
