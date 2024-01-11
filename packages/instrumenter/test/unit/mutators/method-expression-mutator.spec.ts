import { expect } from 'chai';

import { methodExpressionMutator as sut } from '../../../src/mutators/method-expression-mutator.js';
import { expectJSMutation, expectJSMutationWithLevel } from '../../helpers/expect-mutation.js';
import { MutationLevel } from '../../../src/mutation-level/mutation-level.js';

const methodExpressionLevel: MutationLevel = {
  name: 'methodExpressionLevel',
  MethodExpression: ['EndsWithMethodCallNegation', 'StartsWithMethodCallNegation', 'SubstringMethodCallRemoval', 'ToLowerCaseMethodCallNegation'],
};
const methodExpressionUndefinedLevel: MutationLevel = {
  name: 'methodExpressionUndefinedLevel',
  MethodExpression: [],
};

const noLevel = undefined;

const methodsCalls =
  'text.startsWith(); text.endsWith(); text.trim(); text.trimEnd();text.trimStart();text.substr();text.substring();text.toUpperCase();text.toLowerCase();text.toLocaleUpperCase();text.toLocaleLowerCase();text.sort();text.some(); text.every();text.reverse();text.filter();text.slice();text.charAt();text.min();text.max()';

describe(sut.name, () => {
  it('should have name "MethodExpression"', () => {
    expect(sut.name).eq('MethodExpression');
  });

  describe('functions', () => {
    it('should ignore a non-method function', () => {
      expectJSMutation(sut, 'function endsWith() {} endsWith();');
    });
  });

  describe('methods', () => {
    for (const [input, output, description] of [
      ['text.trim();', 'text;', 'removed, non-optional'],
      ['text?.trim();', 'text;', 'removed, optional member'],
      ['text.trim?.();', 'text;', 'removed, optional call'],
      ['text?.trim?.();', 'text;', 'removed, optional member, optional call'],
      ['parent.text?.trim();', 'parent.text;', 'removed, optional member in a non-optional parent'],
      ['parent.text.trim?.();', 'parent.text;', 'removed, optional call in a non-optional parent'],
      ['parent.text?.trim?.();', 'parent.text;', 'removed, optional member, optional call in a non-optional parent'],
      ['parent?.text?.trim();', 'parent?.text;', 'removed, optional member in an optional parent'],
      ['parent?.text.trim?.();', 'parent?.text;', 'removed, optional call in an optional parent'],
      ['parent?.text?.trim?.();', 'parent?.text;', 'removed, optional member, optional call in an optional parent'],
      ['text.startsWith();', 'text.endsWith();', 'replaced, non-optional'],
      ['text?.startsWith();', 'text?.endsWith();', 'replaced, optional member'],
      ['text.startsWith?.();', 'text.endsWith?.();', 'replaced, optional call'],
      ['text?.startsWith?.();', 'text?.endsWith?.();', 'replaced, optional member, optional call'],
      ['text.startsWith("foo").valueOf();', 'text.endsWith("foo").valueOf();', 'replaced in the middle of a chain'],
      ['parent.text?.startsWith();', 'parent.text?.endsWith();', 'replaced, optional member in a non-optional parent'],
      ['parent.text.startsWith?.();', 'parent.text.endsWith?.();', 'replaced, optional call in a non-optional parent'],
      ['parent.text?.startsWith?.();', 'parent.text?.endsWith?.();', 'replaced, optional member, optional call in a non-optional parent'],
      ['parent?.text?.startsWith();', 'parent?.text?.endsWith();', 'replaced, optional member in an optional parent'],
      ['parent?.text.startsWith?.();', 'parent?.text.endsWith?.();', 'replaced, optional call in an optional parent'],
      ['parent?.text?.startsWith?.();', 'parent?.text?.endsWith?.();', 'replaced, optional member, optional call in an optional parent'],
      ['text.trim(abc);', 'text;', 'removed, non-optional with an argument'],
      ['text?.trim(abc);', 'text;', 'removed, optional member with an argument'],
      ['text.trim?.(abc);', 'text;', 'removed, optional call with an argument'],
      ['text?.trim?.(abc);', 'text;', 'removed, optional member, optional call with an argument'],
      ['parent.text?.trim(abc);', 'parent.text;', 'removed, optional member in a non-optional parent with an argument'],
      ['parent.text.trim?.(abc);', 'parent.text;', 'removed, optional call in a non-optional parent with an argument'],
      ['parent.text?.trim?.(abc);', 'parent.text;', 'removed, optional member, optional call in a non-optional parent with an argument'],
      ['parent?.text?.trim(abc);', 'parent?.text;', 'removed, optional member in an optional parent with an argument'],
      ['parent?.text.trim?.(abc);', 'parent?.text;', 'removed, optional call in an optional parent with an argument'],
      ['parent?.text?.trim?.(abc);', 'parent?.text;', 'removed, optional member, optional call in an optional parent with an argument'],
      ['text.startsWith(abc);', 'text.endsWith(abc);', 'replaced, non-optional with an argument'],
      ['text?.startsWith(abc);', 'text?.endsWith(abc);', 'replaced, optional member with an argument'],
      ['text.startsWith?.(abc);', 'text.endsWith?.(abc);', 'replaced, optional call with an argument'],
      ['text?.startsWith?.(abc);', 'text?.endsWith?.(abc);', 'replaced, optional member, optional call with an argument'],
      ['parent.text?.startsWith(abc);', 'parent.text?.endsWith(abc);', 'replaced, optional member in a non-optional parent with an argument'],
      ['parent.text.startsWith?.(abc);', 'parent.text.endsWith?.(abc);', 'replaced, optional call in a non-optional parent with an argument'],
      [
        'parent.text?.startsWith?.(abc);',
        'parent.text?.endsWith?.(abc);',
        'replaced, optional member, optional call in a non-optional parent with an argument',
      ],
      ['parent?.text?.startsWith(abc);', 'parent?.text?.endsWith(abc);', 'replaced, optional member in an optional parent with an argument'],
      ['parent?.text.startsWith?.(abc);', 'parent?.text.endsWith?.(abc);', 'replaced, optional call in an optional parent with an argument'],
      [
        'parent?.text?.startsWith?.(abc);',
        'parent?.text?.endsWith?.(abc);',
        'replaced, optional member, optional call in an optional parent with an argument',
      ],
      ['text.trim(abc, def);', 'text;', 'removed, non-optional with multiple arguments'],
      ['text?.trim(abc, def);', 'text;', 'removed, optional member with multiple arguments'],
      ['text.trim?.(abc, def);', 'text;', 'removed, optional call with multiple arguments'],
      ['text?.trim?.(abc, def);', 'text;', 'removed, optional member, optional call with multiple arguments'],
      ['text.trim().length;', 'text.length;', 'removed in the middle of a chain'],
      ['parent.text?.trim(abc, def);', 'parent.text;', 'removed, optional member in a non-optional parent with multiple arguments'],
      ['parent.text.trim?.(abc, def);', 'parent.text;', 'removed, optional call in a non-optional parent with multiple arguments'],
      ['parent.text?.trim?.(abc, def);', 'parent.text;', 'removed, optional member, optional call in a non-optional parent with multiple arguments'],
      ['parent?.text?.trim(abc, def);', 'parent?.text;', 'removed, optional member in an optional parent with multiple arguments'],
      ['parent?.text.trim?.(abc, def);', 'parent?.text;', 'removed, optional call in an optional parent with multiple arguments'],
      ['parent?.text?.trim?.(abc, def);', 'parent?.text;', 'removed, optional member, optional call in an optional parent with multiple arguments'],
      ['text.startsWith(abc, def);', 'text.endsWith(abc, def);', 'replaced, non-optional with multiple arguments'],
      ['text?.startsWith(abc, def);', 'text?.endsWith(abc, def);', 'replaced, optional member with multiple arguments'],
      ['text.startsWith?.(abc, def);', 'text.endsWith?.(abc, def);', 'replaced, optional call with multiple arguments'],
      ['text?.startsWith?.(abc, def);', 'text?.endsWith?.(abc, def);', 'replaced, optional member, optional call with multiple arguments'],
      [
        'parent.text?.startsWith(abc, def);',
        'parent.text?.endsWith(abc, def);',
        'replaced, optional member in a non-optional parent with multiple arguments',
      ],
      [
        'parent.text.startsWith?.(abc, def);',
        'parent.text.endsWith?.(abc, def);',
        'replaced, optional call in a non-optional parent with multiple arguments',
      ],
      [
        'parent.text?.startsWith?.(abc, def);',
        'parent.text?.endsWith?.(abc, def);',
        'replaced, optional member, optional call in a non-optional parent with multiple arguments',
      ],
      [
        'parent?.text?.startsWith(abc, def);',
        'parent?.text?.endsWith(abc, def);',
        'replaced, optional member in an optional parent with multiple arguments',
      ],
      [
        'parent?.text.startsWith?.(abc, def);',
        'parent?.text.endsWith?.(abc, def);',
        'replaced, optional call in an optional parent with multiple arguments',
      ],
      [
        'parent?.text?.startsWith?.(abc, def);',
        'parent?.text?.endsWith?.(abc, def);',
        'replaced, optional member, optional call in an optional parent with multiple arguments',
      ],
    ]) {
      it(`should be ${description}`, () => {
        expectJSMutation(sut, input, output);
      });
    }

    for (const [key, value] of [
      ['endsWith', 'startsWith'],
      ['every', 'some'],
      ['toLocaleLowerCase', 'toLocaleUpperCase'],
      ['toLowerCase', 'toUpperCase'],
      ['trimEnd', 'trimStart'],
      ['min', 'max'],
    ]) {
      it(`should replace ${key} with ${value}`, () => {
        expectJSMutation(sut, `text.${key}();`, `text.${value}();`);
      });

      it(`should replace ${value} with ${key}`, () => {
        expectJSMutation(sut, `text.${value}();`, `text.${key}();`);
      });
    }

    for (const method of ['charAt', 'filter', 'reverse', 'slice', 'sort', 'substr', 'substring', 'trim']) {
      it(`should remove ${method}`, () => {
        expectJSMutation(sut, `text.${method}();`, 'text;');
      });
    }

    it('should ignore computed properties', () => {
      expectJSMutation(sut, "text['trim']();");
    });

    it('should ignore new expressions', () => {
      expectJSMutation(sut, 'new text.trim();');
    });
  });

  describe('mutation level', () => {
    it('should only mutate startsWith, toLowerCase, substring and endsWith', () => {
      expectJSMutationWithLevel(
        sut,
        methodExpressionLevel.MethodExpression,
        methodsCalls,
        'text.endsWith(); text.endsWith(); text.trim(); text.trimEnd();text.trimStart();text.substr();text.substring();text.toUpperCase();text.toLowerCase();text.toLocaleUpperCase();text.toLocaleLowerCase();text.sort();text.some(); text.every();text.reverse();text.filter();text.slice();text.charAt();text.min();text.max()', // mutates startsWith()
        'text.startsWith(); text.endsWith(); text.trim(); text.trimEnd();text.trimStart();text.substr();text.substring();text.toUpperCase();text.toUpperCase();text.toLocaleUpperCase();text.toLocaleLowerCase();text.sort();text.some(); text.every();text.reverse();text.filter();text.slice();text.charAt();text.min();text.max()', // mutates toLowerCase()
        'text.startsWith(); text.endsWith(); text.trim(); text.trimEnd();text.trimStart();text.substr();text;text.toUpperCase();text.toLowerCase();text.toLocaleUpperCase();text.toLocaleLowerCase();text.sort();text.some(); text.every();text.reverse();text.filter();text.slice();text.charAt();text.min();text.max()', // removes substring()
        'text.startsWith(); text.startsWith(); text.trim(); text.trimEnd();text.trimStart();text.substr();text.substring();text.toUpperCase();text.toLowerCase();text.toLocaleUpperCase();text.toLocaleLowerCase();text.sort();text.some(); text.every();text.reverse();text.filter();text.slice();text.charAt();text.min();text.max()', // mutates endsWith
      );
    });

    it('should not perform any ' + sut.name + ' mutations', () => {
      expectJSMutationWithLevel(sut, methodExpressionUndefinedLevel.MethodExpression, methodsCalls);
    });

    it('should perform all ' + sut.name + ' mutations', () => {
      expectJSMutationWithLevel(
        sut,
        noLevel,
        methodsCalls,
        'text.endsWith(); text.endsWith(); text.trim(); text.trimEnd();text.trimStart();text.substr();text.substring();text.toUpperCase();text.toLowerCase();text.toLocaleUpperCase();text.toLocaleLowerCase();text.sort();text.some(); text.every();text.reverse();text.filter();text.slice();text.charAt();text.min();text.max()', // mutates startsWith()
        'text.startsWith(); text.endsWith(); text.trim(); text.trimEnd();text.trimEnd();text.substr();text.substring();text.toUpperCase();text.toLowerCase();text.toLocaleUpperCase();text.toLocaleLowerCase();text.sort();text.some(); text.every();text.reverse();text.filter();text.slice();text.charAt();text.min();text.max()', // mutates trimStart()
        'text.startsWith(); text.endsWith(); text.trim(); text.trimEnd();text.trimStart();text.substr();text.substring();text.toLowerCase();text.toLowerCase();text.toLocaleUpperCase();text.toLocaleLowerCase();text.sort();text.some(); text.every();text.reverse();text.filter();text.slice();text.charAt();text.min();text.max()', // mutates toUpperCase()
        'text.startsWith(); text.endsWith(); text.trim(); text.trimEnd();text.trimStart();text.substr();text.substring();text.toUpperCase();text.toLowerCase();text.toLocaleLowerCase();text.toLocaleLowerCase();text.sort();text.some(); text.every();text.reverse();text.filter();text.slice();text.charAt();text.min();text.max()', // mutates toLocaleUpperCase()
        'text.startsWith(); text.endsWith(); text.trim(); text.trimEnd();text.trimStart();text.substr();text.substring();text.toUpperCase();text.toLowerCase();text.toLocaleUpperCase();text.toLocaleLowerCase();text.sort();text.every(); text.every();text.reverse();text.filter();text.slice();text.charAt();text.min();text.max()', // mutates some()
        'text.startsWith(); text.endsWith(); text.trim(); text.trimEnd();text.trimStart();text.substr();text.substring();text.toUpperCase();text.toLowerCase();text.toLocaleUpperCase();text.toLocaleLowerCase();text.sort();text.some(); text.every();text.reverse();text.filter();text.slice();text;text.min();text.max()', // removes charAt()
        'text.startsWith(); text.endsWith(); text.trim(); text.trimEnd();text.trimStart();text.substr();text.substring();text.toUpperCase();text.toLowerCase();text.toLocaleUpperCase();text.toLocaleLowerCase();text.sort();text.some(); text.every();text.reverse();text.filter();text;text.charAt();text.min();text.max()', // removes slice()
        'text.startsWith(); text.endsWith(); text.trim(); text.trimEnd();text.trimStart();text.substr();text.substring();text.toUpperCase();text.toLowerCase();text.toLocaleUpperCase();text.toLocaleLowerCase();text.sort();text.some(); text.every();text.reverse();text;text.slice();text.charAt();text.min();text.max()', // removes filter()
        'text.startsWith(); text.endsWith(); text.trim(); text.trimEnd();text.trimStart();text.substr();text.substring();text.toUpperCase();text.toLowerCase();text.toLocaleUpperCase();text.toLocaleLowerCase();text.sort();text.some(); text.every();text;text.filter();text.slice();text.charAt();text.min();text.max()', // removes reverse()
        'text.startsWith(); text.endsWith(); text.trim(); text.trimEnd();text.trimStart();text.substr();text.substring();text.toUpperCase();text.toLowerCase();text.toLocaleUpperCase();text.toLocaleLowerCase();text.sort();text.some(); text.some();text.reverse();text.filter();text.slice();text.charAt();text.min();text.max()', // mutates every()
        'text.startsWith(); text.endsWith(); text.trim(); text.trimEnd();text.trimStart();text.substr();text.substring();text.toUpperCase();text.toLowerCase();text.toLocaleUpperCase();text.toLocaleLowerCase();text;text.some(); text.every();text.reverse();text.filter();text.slice();text.charAt();text.min();text.max()', // removes sort()
        'text.startsWith(); text.endsWith(); text.trim(); text.trimEnd();text.trimStart();text.substr();text.substring();text.toUpperCase();text.toUpperCase();text.toLocaleUpperCase();text.toLocaleLowerCase();text.sort();text.some(); text.every();text.reverse();text.filter();text.slice();text.charAt();text.min();text.max()', // mutates toLowerCase()
        'text.startsWith(); text.endsWith(); text.trim(); text.trimEnd();text.trimStart();text.substr();text;text.toUpperCase();text.toLowerCase();text.toLocaleUpperCase();text.toLocaleLowerCase();text.sort();text.some(); text.every();text.reverse();text.filter();text.slice();text.charAt();text.min();text.max()', // removes substring()
        'text.startsWith(); text.endsWith(); text.trim(); text.trimEnd();text.trimStart();text;text.substring();text.toUpperCase();text.toLowerCase();text.toLocaleUpperCase();text.toLocaleLowerCase();text.sort();text.some(); text.every();text.reverse();text.filter();text.slice();text.charAt();text.min();text.max()', // removes substr()
        'text.startsWith(); text.endsWith(); text.trim(); text.trimStart();text.trimStart();text.substr();text.substring();text.toUpperCase();text.toLowerCase();text.toLocaleUpperCase();text.toLocaleLowerCase();text.sort();text.some(); text.every();text.reverse();text.filter();text.slice();text.charAt();text.min();text.max()', // mutates trimEnd()
        'text.startsWith(); text.endsWith(); text.trim(); text.trimEnd();text.trimStart();text.substr();text.substring();text.toUpperCase();text.toLowerCase();text.toLocaleUpperCase();text.toLocaleUpperCase();text.sort();text.some(); text.every();text.reverse();text.filter();text.slice();text.charAt();text.min();text.max()', // mutates toLocaleLowerCase()
        'text.startsWith(); text.endsWith(); text; text.trimEnd();text.trimStart();text.substr();text.substring();text.toUpperCase();text.toLowerCase();text.toLocaleUpperCase();text.toLocaleLowerCase();text.sort();text.some(); text.every();text.reverse();text.filter();text.slice();text.charAt();text.min();text.max()', // removes trim()
        'text.startsWith(); text.startsWith(); text.trim(); text.trimEnd();text.trimStart();text.substr();text.substring();text.toUpperCase();text.toLowerCase();text.toLocaleUpperCase();text.toLocaleLowerCase();text.sort();text.some(); text.every();text.reverse();text.filter();text.slice();text.charAt();text.min();text.max()', // mutates endsWith()
        'text.startsWith(); text.endsWith(); text.trim(); text.trimEnd();text.trimStart();text.substr();text.substring();text.toUpperCase();text.toLowerCase();text.toLocaleUpperCase();text.toLocaleLowerCase();text.sort();text.some(); text.every();text.reverse();text.filter();text.slice();text.charAt();text.max();text.max()', // mutates min()
        'text.startsWith(); text.endsWith(); text.trim(); text.trimEnd();text.trimStart();text.substr();text.substring();text.toUpperCase();text.toLowerCase();text.toLocaleUpperCase();text.toLocaleLowerCase();text.sort();text.some(); text.every();text.reverse();text.filter();text.slice();text.charAt();text.min();text.min()', // mutates max()
      );
    });
  });
});
