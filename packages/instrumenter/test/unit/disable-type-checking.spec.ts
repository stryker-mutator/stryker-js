import { File } from '@stryker-mutator/api/core';
import { assertions } from '@stryker-mutator/test-helpers';

import { disableTypeChecking } from '../../src';

describe(disableTypeChecking.name, () => {
  describe('with a JS (or friend) file', () => {
    it('should remove @ts directive from single line', async () => {
      await arrangeActAssert('// @ts-check\nfoo.bar();', '// \nfoo.bar();');
    });

    it('should remove @ts directive from multiline', async () => {
      await arrangeActAssert('/* @ts-expect-error */\nfoo.bar();', '/*  */\nfoo.bar();');
    });

    describe('with string', () => {
      it('should not remove @ts directive in double quoted string', async () => {
        await arrangeActAssert('foo.bar("/* @ts-expect-error */")');
      });

      it('should not remove @ts directive in double quoted string after escaped double quote', async () => {
        await arrangeActAssert('foo.bar("foo \\"/* @ts-expect-error */")');
      });

      it('should remove @ts directive after a string', async () => {
        await arrangeActAssert('foo.bar("foo \\" bar "/* @ts-expect-error */,\nbaz.qux())', 'foo.bar("foo \\" bar "/*  */,\nbaz.qux())');
      });

      it('should not remove @ts directive in single quoted string', async () => {
        await arrangeActAssert("foo.bar('/* @ts-expect-error */')");
      });
    });

    describe('with regex literals', () => {
      it('should not remove @ts directive inside the regex', async () => {
        await arrangeActAssert('const regex = / \\/*@ts-check */');
      });

      it('should remove @ts directives just after a regex', async () => {
        await arrangeActAssert('const regex = / \\/*@ts-check */// @ts-expect-error\nfoo.bar()', 'const regex = / \\/*@ts-check */// \nfoo.bar()');
      });

      it('should allow escape sequence inside the regex', async () => {
        await arrangeActAssert('const regex = / \\/ /; // @ts-expect-error', 'const regex = / \\/ /; // ');
      });

      it('should allow `/` inside a character class', async () => {
        await arrangeActAssert('const regex = / [/] /; // @ts-check', 'const regex = / [/] /; // ');
      });
    });

    describe('with template strings', () => {
      it('should not remove @ts directive inside the literal', async () => {
        await arrangeActAssert('const foo = `/*@ts-check */`');
      });
    });

    async function arrangeActAssert(input: string, expectedOutput = input) {
      const inputFile = new File('foo.tsx', input);
      const actual = await disableTypeChecking(inputFile, { plugins: null });
      assertions.expectTextFileEqual(actual, new File('foo.tsx', `// @ts-nocheck\n${expectedOutput}`));
    }
  });
});
