import { expect } from 'chai';

import { methodExpressionMutator as sut } from '../../../src/mutators/method-expression-mutator.js';
import { expectJSMutation } from '../../helpers/expect-mutation.js';

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

    for (const [key, value, noReverse] of [
      ['endsWith', 'startsWith'],
      ['every', 'some'],
      ['toLocaleLowerCase', 'toLocaleUpperCase'],
      ['toLowerCase', 'toUpperCase'],
      ['trimEnd', 'trimStart'],
      ['min', 'max'],
      ['setDate', 'setTime'],
      ['setFullYear', 'setMonth'],
      ['setHours', 'setMinutes'],
      ['setSeconds', 'setMilliseconds'],
      ['setUTCDate', 'setTime', true],
      ['setUTCFullYear', 'setUTCMonth'],
      ['setUTCHours', 'setUTCMinutes'],
      ['setUTCSeconds', 'setUTCMilliseconds'],
    ]) {
      it(`should replace ${key} with ${value}`, () => {
        expectJSMutation(sut, `text.${key}();`, `text.${value}();`);
      });

      if (!noReverse) {
        it(`should replace ${value} with ${key}`, () => {
          expectJSMutation(sut, `text.${value}();`, `text.${key}();`);
        });
      }
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
});
