import { expect } from 'chai';

import { arrayDeclarationMutator as sut } from '../../../src/mutators/array-declaration-mutator.js';
import { expectJSMutation, expectJSMutationWithLevel } from '../../helpers/expect-mutation.js';
import { MutationLevel } from '../../../src/mutation-level/mutation-level.js';

const arrayLiteralLevel: MutationLevel = {
  name: 'ArrayLiteralLevel',
  ArrayDeclaration: ['ArrayLiteralItemsFill', 'ArrayLiteralItemsRemoval'],
};
const arrayConstructorLevel: MutationLevel = {
  name: 'ArrayConstructorLevel',
  ArrayDeclaration: ['ArrayConstructorItemsFill', 'ArrayConstructorItemsRemoval'],
};
const arrayDeclarationOperatorUndefinedLevel: MutationLevel = { name: 'ArrayDeclarationcOperatorOperatorLevel', ArrayDeclaration: [] };
const noLevel = undefined;

describe(sut.name, () => {
  it('should have name "ArrayDeclaration"', () => {
    expect(sut.name).eq('ArrayDeclaration');
  });

  it('should mutate filled array literals as empty arrays', () => {
    expectJSMutation(sut, '[a, 1 + 1]', '[]');
    expectJSMutation(sut, "['val']", '[]');
  });

  it('should mutate empty array literals as a filled array', () => {
    expectJSMutation(sut, '[]', '["Stryker was here"]');
  });

  it('should mutate filled Array constructor calls as empty arrays', () => {
    expectJSMutation(sut, 'new Array(a, 1 + 1)', 'new Array()');
    expectJSMutation(sut, "new Array('val')", 'new Array()');
    expectJSMutation(sut, "Array('val')", 'Array()');
    expectJSMutation(sut, 'Array(a, 1 + 1)', 'Array()');
  });

  it('should not mutate other new expressions', () => {
    expectJSMutation(sut, 'new Object(21, 2)');
    expectJSMutation(sut, 'new Arrays(21, 2)');
  });

  it('should mutate empty array constructor call as a filled array', () => {
    expectJSMutation(sut, 'new Array()', 'new Array("Stryker was here")');
    expectJSMutation(sut, 'Array()', 'Array("Stryker was here")');
  });

  it('should not mutate other function call expressions', () => {
    expectJSMutation(sut, 'window.Array(21, 2)');
    expectJSMutation(sut, 'window["Array"](21, 2)');
  });

  describe('mutation level', () => {
    it('should only mutate [],  [x,y]', () => {
      expectJSMutationWithLevel(
        sut,
        arrayLiteralLevel.ArrayDeclaration,
        '[]; new Array(); new Array({x:"", y:""}); [{x:"", y:""}]',
        '["Stryker was here"]; new Array(); new Array({x:"", y:""}); [{x:"", y:""}]', // mutates []
        '[]; new Array(); new Array({x:"", y:""}); []', // mutates [x,y]
      );
    });

    it('should only mutate new Array(), new Array({x:"", y:""}))', () => {
      expectJSMutationWithLevel(
        sut,
        arrayConstructorLevel.ArrayDeclaration,
        '[]; new Array(); new Array({x:"", y:""}); [{x:"", y:""}]',
        '[]; new Array("Stryker was here"); new Array({x:"", y:""}); [{x:"", y:""}]', // mutates new Array()
        '[]; new Array(); new Array(); [{x:"", y:""}]', // mutates new Array(x,y)
      );
    });

    it('should not perform any ' + sut.name + ' mutations', () => {
      expectJSMutationWithLevel(
        sut,
        arrayDeclarationOperatorUndefinedLevel.ArrayDeclaration,
        '[]; new Array(); new Array({x:"", y:""}); [{x:"", y:""}]',
      );
    });

    it('should perform all ' + sut.name + ' mutations', () => {
      expectJSMutationWithLevel(
        sut,
        noLevel,
        '[]; new Array(); new Array({x:"", y:""}); [{x:"", y:""}]',
        '["Stryker was here"]; new Array(); new Array({x:"", y:""}); [{x:"", y:""}]', // mutates []
        '[]; new Array("Stryker was here"); new Array({x:"", y:""}); [{x:"", y:""}]', // mutates new Array()
        '[]; new Array(); new Array(); [{x:"", y:""}]', // mutates new Array(x,y)
        '[]; new Array(); new Array({x:"", y:""}); []', // mutates [x,y]
      );
    });
  });
});
