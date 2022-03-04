import { File } from '@stryker-mutator/api/core';
import { assertions } from '@stryker-mutator/test-helpers';

import { disableTypeChecks } from '../../src/index.js';

describe(disableTypeChecks.name, () => {
  describe('with TS or JS AST format', () => {
    it('should prefix the file with `// @ts-nocheck`', async () => {
      const inputFile = new File('foo.js', 'foo.bar();');
      const actual = await disableTypeChecks(inputFile, { plugins: null });
      assertions.expectTextFileEqual(actual, new File('foo.js', '// @ts-nocheck\nfoo.bar();'));
    });

    describe('with shebang (`#!/usr/bin/env node`)', () => {
      it('should insert `// @ts-nocheck` after the new line', async () => {
        const inputFile = new File('foo.js', '#!/usr/bin/env node\nfoo.bar();');
        const actual = await disableTypeChecks(inputFile, { plugins: null });
        assertions.expectTextFileEqual(actual, new File('foo.js', '#!/usr/bin/env node\n// @ts-nocheck\nfoo.bar();'));
      });
      it('should not insert if there is no code', async () => {
        const inputFile = new File('foo.js', '#!/usr/bin/env node');
        const actual = await disableTypeChecks(inputFile, { plugins: null });
        assertions.expectTextFileEqual(actual, new File('foo.js', '#!/usr/bin/env node'));
      });
    });

    describe('with jest directive (`@jest-environment`)', () => {
      it('should insert `// @ts-nocheck` after the jest directive', async () => {
        const inputFile = new File('foo.js', '/**\n* @jest-environment jsdom\n*/\nfoo.bar();');
        const actual = await disableTypeChecks(inputFile, { plugins: null });
        assertions.expectTextFileEqual(actual, new File('foo.js', '/**\n* @jest-environment jsdom\n*/\n// @ts-nocheck\n\nfoo.bar();'));
      });
    });

    it('should not even parse the file if "@ts-" can\'t be found anywhere in the file (performance optimization)', async () => {
      const inputFile = new File('foo.js', 'some garbage that cannot be parsed');
      const actual = await disableTypeChecks(inputFile, { plugins: null });
      assertions.expectTextFileEqual(actual, new File('foo.js', '// @ts-nocheck\nsome garbage that cannot be parsed'));
    });

    it('should remove @ts directives from a JS file', async () => {
      const inputFile = new File('foo.js', '// @ts-check\nfoo.bar();');
      const actual = await disableTypeChecks(inputFile, { plugins: null });
      assertions.expectTextFileEqual(actual, new File('foo.js', '// @ts-nocheck\n// \nfoo.bar();'));
    });

    it('should remove @ts directives from a TS file', async () => {
      const inputFile = new File('foo.ts', '// @ts-check\nfoo.bar();');
      const actual = await disableTypeChecks(inputFile, { plugins: null });
      assertions.expectTextFileEqual(actual, new File('foo.ts', '// @ts-nocheck\n// \nfoo.bar();'));
    });

    it('should remove @ts directive from single line', async () => {
      await arrangeActAssert('baz();// @ts-check\nfoo.bar();', 'baz();// \nfoo.bar();');
    });

    it('should not remove @ts comments which occur later on the comment line (since then they are not considered a directive)', async () => {
      await arrangeActAssert('// this should be ignored: @ts-expect-error\nfoo.bar();');
    });

    it('should remove @ts directive from multiline', async () => {
      await arrangeActAssert('baz();/* @ts-expect-error */\nfoo.bar();', 'baz();/*  */\nfoo.bar();');
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
      const actual = await disableTypeChecks(inputFile, { plugins: null });
      assertions.expectTextFileEqual(actual, new File('foo.tsx', `// @ts-nocheck\n${expectedOutput}`));
    }
  });

  describe('with HTML ast format', () => {
    it('should prefix the script tags with `// @ts-nocheck`', async () => {
      const inputFile = new File('foo.vue', '<template></template><script>foo.bar();</script>');
      const actual = await disableTypeChecks(inputFile, { plugins: null });
      assertions.expectTextFileEqual(actual, new File('foo.vue', '<template></template><script>\n// @ts-nocheck\nfoo.bar();\n</script>'));
    });

    it('should remove `// @ts` directives from script tags', async () => {
      const inputFile = new File('foo.html', '<template></template><script>// @ts-expect-error\nconst foo = "bar"-"baz";</script>');
      const actual = await disableTypeChecks(inputFile, { plugins: null });
      assertions.expectTextFileEqual(
        actual,
        new File('foo.html', '<template></template><script>\n// @ts-nocheck\n// \nconst foo = "bar"-"baz";\n</script>')
      );
    });

    it('should not remove `// @ts` from the html itself', async () => {
      const inputFile = new File('foo.vue', '<template>\n// @ts-expect-error\n</template>');
      const actual = await disableTypeChecks(inputFile, { plugins: null });
      assertions.expectTextFileEqual(actual, new File('foo.vue', '<template>\n// @ts-expect-error\n</template>'));
    });
  });
});
