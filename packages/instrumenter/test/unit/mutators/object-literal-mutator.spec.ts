import { expect } from 'chai';

import { objectLiteralMutator as sut } from '../../../src/mutators/object-literal-mutator.js';
import { expectJSMutation } from '../../helpers/expect-mutation.js';

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
});
