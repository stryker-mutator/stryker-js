import sinon from 'sinon';
import { expect } from 'chai';
import babel from '@babel/core';
import generator from '@babel/generator';
import { normalizeWhitespaces } from '@stryker-mutator/util';
import { MutateDescription } from '@stryker-mutator/api/core';

import { transformerContextStub } from '../../helpers/stubs.js';
import { AstTransformer, TransformerContext } from '../../../src/transformers/index.js';
import { MutantCollector } from '../../../src/transformers/mutant-collector.js';
import { transformBabel } from '../../../src/transformers/babel-transformer.js';
import { ScriptAst, ScriptFormat } from '../../../src/syntax/index.js';
import { instrumentationBabelHeader } from '../../../src/util/index.js';
import { MutantPlacer } from '../../../src/mutant-placers/index.js';
import { NodeMutator } from '../../../src/mutators/index.js';
import { createJSAst, createTSAst } from '../../helpers/factories.js';

const generate = generator.default;
const { types } = babel;

/**
 * The babel-transformer is pretty complex and has a lot of recursion.
 * In order to keep our sanity, we've chosen to NOT use sinon for stubbing here.
 * Instead, we create some test doubles that we inject (mutators and mutant placers).
 * It works out quite nice in the end and we feel the test cases are quite robust.
 */
describe('babel-transformer', () => {
  let context: sinon.SinonStubbedInstance<TransformerContext>;
  let mutators: NodeMutator[];
  let mutantPlacers: MutantPlacer[];
  let mutantCollector: MutantCollector;

  const fooMutator: NodeMutator = {
    name: 'Foo',
    *mutate(path) {
      if (path.isIdentifier() && path.node.name === 'foo') {
        yield types.identifier('bar');
      }
    },
  };
  const plusMutator: NodeMutator = {
    name: 'Plus',
    *mutate(path) {
      if (path.isBinaryExpression() && path.node.operator === '+') {
        yield types.binaryExpression('-', types.cloneNode(path.node.left, true), types.cloneNode(path.node.right, true));
      }
    },
  };

  const blockStatementPlacer: MutantPlacer<babel.types.Statement> = {
    name: 'blockStatementPlacerForTest',
    canPlace: (path) => path.isStatement(),
    place: (path, appliedMutants) => path.replaceWith(types.blockStatement([...appliedMutants.values(), path.node])),
  };
  const sequenceExpressionPlacer: MutantPlacer<babel.types.SequenceExpression> = {
    name: 'sequenceExpressionPlacerForTest',
    canPlace: (path) => path.isSequenceExpression(),
    place: (path, appliedMutants) =>
      path.replaceWith(types.sequenceExpression([...[...appliedMutants.values()].flatMap((val) => val.expressions), ...path.node.expressions])),
  };

  beforeEach(() => {
    context = transformerContextStub();
    mutantCollector = new MutantCollector();
    mutators = [fooMutator, plusMutator];
    mutantPlacers = [blockStatementPlacer, sequenceExpressionPlacer];
  });

  describe('the algorithm', () => {
    it('should be able to transform a simple AST and collect the mutants', () => {
      const ast = createJSAst({ rawContent: 'foo = bar + baz;' });
      act(ast);
      expect(mutantCollector.mutants).lengthOf(2);
      expect(mutantCollector.mutants[0].replacementCode).eq('bar');
      expect(mutantCollector.mutants[0].mutatorName).eq('Foo');
      expect(mutantCollector.mutants[1].replacementCode).eq('bar - baz');
      expect(mutantCollector.mutants[1].mutatorName).eq('Plus');
      expect(normalizeWhitespaces(generate(ast.root).code)).contains('{ bar = bar + baz; foo = bar - baz; foo = bar + baz; }');
    });

    it('should not place the same mutant twice (#2968)', () => {
      const ast = createJSAst({ rawContent: 'foo((console.log(bar + baz), bar + baz));' });
      act(ast);
      const { code } = generate(ast.root);
      expect(normalizeWhitespaces(code)).contains(
        normalizeWhitespaces(`{
        bar((console.log(bar + baz), bar + baz));
        foo((console.log(bar - baz), bar + baz, console.log(bar + baz), bar - baz, console.log(bar + baz), bar + baz));
      }`),
      );
    });

    it('should throw a decent placement error when something goes wrong', () => {
      // Arrange
      const brokenPlacer: MutantPlacer<babel.types.Identifier> = {
        name: 'brokenPlacer',
        canPlace: (path) => path.isIdentifier(),
        place: () => {
          throw new Error('Expected error for testing');
        },
      };
      mutantPlacers.push(brokenPlacer);
      const ast = createJSAst({ rawContent: 'foo("bar")' });

      // Act
      expect(() => act(ast)).throws('example.js:1:0 brokenPlacer could not place mutants with type(s): "Foo".');
    });
  });

  describe('excluded mutations', () => {
    it('should not place mutants that are ignored', () => {
      const ast = createJSAst({ rawContent: 'foo = bar + baz;' });
      context.options.excludedMutations = ['Foo'];
      act(ast);
      const result = normalizeWhitespaces(generate(ast.root).code);
      expect(result).not.include('bar = bar + baz;');
    });
    it('should still place other mutants', () => {
      const ast = createJSAst({ rawContent: 'foo = bar + baz;' });
      context.options.excludedMutations = ['Foo'];
      act(ast);
      const result = normalizeWhitespaces(generate(ast.root).code);
      expect(result).include('foo = bar - baz');
    });
    it('should collect ignored mutants with correct ignore message', () => {
      const ast = createJSAst({ rawContent: 'foo' });
      context.options.excludedMutations = ['Foo'];
      act(ast);
      expect(mutantCollector.mutants).lengthOf(1);
      expect(mutantCollector.mutants[0].ignoreReason).eq('Ignored because of excluded mutation "Foo"');
    });
  });

  describe('skips', () => {
    it('should skip type annotations', () => {
      const ast = createTSAst({ rawContent: 'let bar: foo;' });
      act(ast);
      expect(mutantCollector.mutants).lengthOf(0);
    });

    it('should skip `as` expressions', () => {
      const ast = createTSAst({ rawContent: 'let bar = "bar" as foo' });
      act(ast);
      expect(mutantCollector.mutants).lengthOf(0);
    });

    it('should skip TSDeclareFunction statements', () => {
      const ast = createTSAst({ rawContent: 'declare function foo(): "foo";' });
      act(ast);
      expect(mutantCollector.mutants).lengthOf(0);
    });

    it('should skip `declare const foo: "foo"` statements', () => {
      const ast = createTSAst({ rawContent: 'declare const foo: "foo";' });
      act(ast);
      expect(mutantCollector.mutants).lengthOf(0);
    });

    it('should skip generic parameters', () => {
      const ast = createTSAst({ rawContent: 'React.useState<foo | false>()' });
      act(ast);
      expect(mutantCollector.mutants).lengthOf(0);
    });

    it('should skip import declarations', () => {
      const ast = createTSAst({ rawContent: "import foo from 'b'" });
      act(ast);
      expect(mutantCollector.mutants).lengthOf(0);
    });

    it('should skip decorators', () => {
      const ast = createTSAst({ rawContent: '@Component(foo) class A {}' });
      act(ast);
      expect(mutantCollector.mutants).lengthOf(0);
    });
  });

  describe('with directive', () => {
    function notIgnoredMutants() {
      return mutantCollector.mutants.filter((mutant) => !mutant.ignoreReason);
    }
    function ignoredMutants() {
      return mutantCollector.mutants.filter((mutant) => Boolean(mutant.ignoreReason));
    }

    describe('"Stryker disable next-line"', () => {
      it('should ignore all mutants with the leading comment', () => {
        const ast = createTSAst({
          rawContent: `
          // Stryker disable next-line all
        const foo = 1 + 1;
        `,
        });
        act(ast);
        expect(notIgnoredMutants()).lengthOf(0);
      });

      it('should ignore mutants that spawn multiple lines', () => {
        const ast = createTSAst({
          rawContent: `
          // Stryker disable next-line all
        const foo = 1 +
         1;
        `,
        });
        act(ast);
        expect(notIgnoredMutants()).lengthOf(0);
      });

      it('should be supported in the middle of a function call', () => {
        const ast = createTSAst({
          rawContent: `
        console.log(
          // Stryker disable next-line plus
          1 + 1
         );
        `,
        });
        act(ast);
        expect(notIgnoredMutants()).lengthOf(0);
      });

      it('should only ignore a single line', () => {
        const ast = createTSAst({
          rawContent: `
          // Stryker disable next-line all
          let foo = 1 + 1;
          foo = 1 + 1;
        `,
        });
        act(ast);
        expect(ignoredMutants()).lengthOf(2);
        expect(ignoredMutants().map((mutant) => mutant.original.loc!.start.line)).deep.eq([3, 3]);
        expect(notIgnoredMutants()).lengthOf(2);
        expect(notIgnoredMutants().map((mutant) => mutant.original.loc!.start.line)).deep.eq([4, 4]);
      });

      it('should ignore a mutant when lead with a "Stryker disable next-line mutator" comment targeting that mutant', () => {
        const ast = createTSAst({
          rawContent: `
          // Stryker disable next-line plus
        const foo = 1 + 1;
        `,
        });
        act(ast);
        expect(notIgnoredMutants()).lengthOf(1);
        expect(ignoredMutants()).lengthOf(1);
        const [ignoredMutant] = ignoredMutants();
        expect(ignoredMutant.mutatorName).eq('Plus');
      });

      it('should ignore mutants when lead with a "Stryker disable next-line mutator" comment targeting with multiple mutators', () => {
        const ast = createTSAst({
          rawContent: `
          // Stryker disable next-line plus,foo
        const foo = 1 + 1;
        `,
        });
        act(ast);
        expect(ignoredMutants()).lengthOf(2);
      });

      it('should ignore mutants when lead with multiple "Stryker disable next-line mutator" comments spread over multiple lines', () => {
        const ast = createTSAst({
          rawContent: `
          // Stryker disable next-line plus
          // Stryker disable next-line foo
        const foo = 1 + 1;
        `,
        });
        act(ast);
        expect(ignoredMutants()).lengthOf(2);
      });

      it('should ignore mutants when lead with a "Stryker disable next-line all" comment', () => {
        const ast = createTSAst({
          rawContent: `
          // Stryker disable next-line all
        const foo = 1 + 1;
        `,
        });
        act(ast);
        expect(ignoredMutants()).lengthOf(2);
      });

      it('should allow users to add an ignore reasons', () => {
        const ast = createTSAst({
          rawContent: `
          // Stryker disable next-line foo: I don't like foo
        const foo = "bar";
        `,
        });
        act(ast);
        expect(mutantCollector.mutants[0].ignoreReason).to.equal("I don't like foo");
      });

      it('should allow multiple user comments for one line', () => {
        const ast = createTSAst({
          rawContent: `
          // Stryker disable next-line foo: I don't like foo
          // Stryker disable next-line plus: I also don't like plus
        const foo = 1 + 1;
        `,
        });
        act(ast);
        expect(mutantCollector.mutants.find((mutant) => mutant.mutatorName === 'Foo')?.ignoreReason).to.equal("I don't like foo");
        expect(mutantCollector.mutants.find((mutant) => mutant.mutatorName === 'Plus')?.ignoreReason).to.equal("I also don't like plus");
      });
    });

    describe('"Stryker disable"', () => {
      it('should ignore all following mutants', () => {
        const ast = createTSAst({
          rawContent: `
          // Stryker disable all
          const a = 1 + 1;
          const b = 1 + 1;
          const c = 1 + 1;
        `,
        });
        act(ast);
        expect(notIgnoredMutants()).lengthOf(0);
        expect(ignoredMutants()).lengthOf(3);
      });

      it('should not ignore all mutants following a "Stryker restore" comment', () => {
        const ast = createTSAst({
          rawContent: `
              // Stryker disable all
              const a = 1 + 1;
              const b = 1 + 1;
              const c = 1 + 1;
              // Stryker restore all
              
              const foo = 'a';
            `,
        });
        act(ast);
        expect(ignoredMutants()).lengthOf(3);
        expect(notIgnoredMutants()).lengthOf(1);
        const [notIgnoredMutant] = notIgnoredMutants();
        expect(notIgnoredMutant.mutatorName).eq('Foo');
      });

      it('should ignore all mutants, even if some where explicitly disabled with a "Stryker disable next-line" comment', () => {
        const ast = createTSAst({
          rawContent: `
          // Stryker disable all
          a = 1 + 1;
          // Stryker disable next-line Foo: with a custom reason
          foo = 1 + 1;
          c = 1 + 1;
        `,
        });
        act(ast);
        expect(notIgnoredMutants()).lengthOf(0);
        expect(ignoredMutants()).lengthOf(4);
      });

      it('should allow an ignore reason', () => {
        const ast = createTSAst({
          rawContent: `
              // Stryker disable all: Disable everything
              // Stryker disable foo: But have a reason for disabling foo
              const a = 1 + 1;
              const b = 1 + 1;
              const c = 1 + 1;       
              const foo = 'a';
            `,
        });
        act(ast);
        expect(notIgnoredMutants()).lengthOf(0);
        expect(
          mutantCollector.mutants.filter((mutant) => mutant.mutatorName === 'Plus').every((mutant) => mutant.ignoreReason === 'Disable everything'),
        ).to.be.true;
        expect(mutantCollector.mutants.find((mutant) => mutant.mutatorName === 'Foo')!.ignoreReason).to.equal('But have a reason for disabling foo');
      });

      it('should be able to restore a specific mutator that was previously explicitly disabled', () => {
        const ast = createTSAst({
          rawContent: `
              // Stryker disable foo,plus
              const a = 1 + 1;
              const b = 1 + 1;
              const c = 1 + 1;
              // Stryker restore foo
              const foo = 'a';
              const d = 1 + 1;
            `,
        });
        act(ast);
        expect(notIgnoredMutants()).lengthOf(1);
        expect(notIgnoredMutants()[0].mutatorName).eq('Foo');
      });

      it('should be able to restore a specific mutator after all mutators were disabled', () => {
        const ast = createTSAst({
          rawContent: `
              // Stryker disable all
              const a = 1 + 1;
              const b = 1 + 1;
              const c = 1 + 1;
              // Stryker restore foo
              const foo = 'a';
              const d = 1 + 1;
            `,
        });
        act(ast);
        expect(notIgnoredMutants()).lengthOf(1);
        expect(notIgnoredMutants()[0].mutatorName).eq('Foo');
      });

      it('should restore all mutators following a "Stryker restore" comment', () => {
        const ast = createTSAst({
          rawContent: `
              // Stryker disable foo,plus
              const a = 1 + 1;
              const b = 1 + 1;
              const c = 1 + 1;
              // Stryker restore all
              const foo = 'a';
            `,
        });
        act(ast);
        expect(notIgnoredMutants()).lengthOf(1);
        expect(notIgnoredMutants()[0].original.loc!.start.line).eq(7);
      });

      it('should restore a specific mutators when using a "Stryker restore mutant" comment', () => {
        const ast = createTSAst({
          rawContent: `
              // Stryker disable all
              const a = 1 + 1;
              const b = 1 + 1;
              const c = 1 + 1;
              // Stryker restore foo
              const foo = 'a';
              const d = 1 + 1;
            `,
        });
        act(ast);
        expect(notIgnoredMutants()).lengthOf(1);
      });

      it('should warn when a mutator name without scope does not match any of the enabled mutators.', () => {
        const ast = createTSAst({
          rawContent: `// Stryker disable RandomName: This Mutator does not exist
              function test(a, b) {
                return a - b >= 0 ? 1 : -1;
              }
            `,
        });
        act(ast);

        expect(context.logger.warn).calledWithMatch(
          sinon.match("Unused 'Stryker disable' directive. Mutator with name 'RandomName' not found. Directive found at: example.ts:1"),
        );
      });

      it('should warn when a mutator name with scope does not match any of the enabled mutators.', () => {
        const ast = createTSAst({
          rawContent: `// Stryker disable next-line RandomName: This Mutator does not exist
              function test(a, b) {
                return a - b >= 0 ? 1 : -1;
              }
            `,
        });
        act(ast);

        expect(context.logger.warn).calledWithMatch(
          sinon.match("Unused 'Stryker disable next-line' directive. Mutator with name 'RandomName' not found. Directive found at: example.ts:1"),
        );
      });

      it('should warn when a mutator name does not match any of the enabled mutators.', () => {
        const ast = createTSAst({
          rawContent: `// Stryker disable Foo
              // Stryker disable RandomName: This Mutator does not exist
              // Stryker disable Plus
              function test(a, b) {
                return a - b >= 0 ? 1 : -1;
              }
            `,
        });
        act(ast);

        expect(context.logger.warn).calledWithMatch(
          sinon.match("Unused 'Stryker disable' directive. Mutator with name 'RandomName' not found. Directive found at: example.ts:2"),
        );
      });

      it('should not warn when a disabled Mutator exists.', () => {
        const ast = createTSAst({
          rawContent: `
              // Stryker disable Foo
              // Stryker disable all
              function test(a, b) {
                return a - b >= 0 ? 1 : -1;
              }
            `,
        });
        act(ast);

        expect(context.logger.warn).not.called;
      });

      it('should allow to restore for next-line using a specific "Stryker restore next-line mutator" comment', () => {
        const ast = createTSAst({
          rawContent: `
              // Stryker disable all
              1 + 1;
              // Stryker restore next-line plus
              1 + foo;
              1 + 1;
            `,
        });
        act(ast);
        expect(notIgnoredMutants()).lengthOf(1);
        expect(ignoredMutants()).lengthOf(3);
        const [actualNotIgnoredMutant] = notIgnoredMutants();
        expect(actualNotIgnoredMutant.mutatorName).eq('Plus');
        expect(actualNotIgnoredMutant.original.loc!.start.line).eq(5);
      });

      it('should allow multiple restore for next-line using a specific "Stryker restore next-line mutator" comment', () => {
        const ast = createTSAst({
          rawContent: `
              // Stryker disable all
              1 + 1;
              // Stryker restore next-line plus
              // Stryker restore next-line foo
              1 + foo;
              1 + 1;
            `,
        });
        act(ast);
        expect(notIgnoredMutants()).lengthOf(2);
        expect(ignoredMutants()).lengthOf(2);
        const [actualRestoredMutantPlus, actualRestoredMutantFoo] = notIgnoredMutants();
        expect(actualRestoredMutantPlus.mutatorName).eq('Plus');
        expect(actualRestoredMutantPlus.original.loc!.start.line).eq(6);
        expect(actualRestoredMutantFoo.mutatorName).eq('Foo');
        expect(actualRestoredMutantFoo.original.loc!.start.line).eq(6);
      });

      it('should allow to restore for next-line using a "Stryker restore next-line all" comment', () => {
        const ast = createTSAst({
          rawContent: `
              // Stryker disable all
              1 + 1;
              // Stryker restore next-line all
              1 + foo;
              1 + 1;
            `,
        });
        act(ast);
        expect(notIgnoredMutants()).lengthOf(2);
        expect(ignoredMutants()).lengthOf(2);
        const [actualNotIgnoredPlusMutant, actualNotIgnoredFooMutant] = notIgnoredMutants();
        expect(actualNotIgnoredPlusMutant.mutatorName).eq('Plus');
        expect(actualNotIgnoredPlusMutant.original.loc!.start.line).eq(5);
        expect(actualNotIgnoredFooMutant.mutatorName).eq('Foo');
        expect(actualNotIgnoredFooMutant.original.loc!.start.line).eq(5);
      });

      it('should allow disable, restore mutator, disable all', () => {
        const ast = createTSAst({
          rawContent: `
              // Stryker disable all
              1 + 1;
              // Stryker restore plus
              1 + 1;
              // Stryker disable all
              1 + 1;
            `,
        });
        act(ast);

        expect(notIgnoredMutants()).lengthOf(1);
        expect(ignoredMutants()).lengthOf(2);
        const [actualNotIgnoredFooMutant] = notIgnoredMutants();
        expect(actualNotIgnoredFooMutant.mutatorName).eq('Plus');
        expect(actualNotIgnoredFooMutant.original.loc!.start.line).eq(5);
      });

      it('should allow disable mutator, restore all, disable mutator', () => {
        const ast = createTSAst({
          rawContent: `
              // Stryker disable plus
              1 + 1;
              // Stryker restore all
              1 + 1;
              // Stryker disable plus
              1 + 1;
            `,
        });
        act(ast);

        expect(notIgnoredMutants()).lengthOf(1);
        expect(ignoredMutants()).lengthOf(2);
        const [actualNotIgnoredFooMutant] = notIgnoredMutants();
        expect(actualNotIgnoredFooMutant.mutatorName).eq('Plus');
        expect(actualNotIgnoredFooMutant.original.loc!.start.line).eq(5);
      });
    });
  });

  describe('with mutateDescription', () => {
    let ast: ScriptAst;

    beforeEach(() => {
      ast = createJSAst({
        originFileName: 'foo.js',
        rawContent:
          'console.log(foo);\n' + // line 1
          'console.log(foo);\n' + // line 2
          '{\n' +
          'console.log(bar);\n' + //line 4
          'console.log(bar);\n' + //line 5
          '}\n' +
          'console.log(foo);\n', // line 7
      });
      mutators.push({
        name: 'blockMutatorForTest',
        *mutate(path) {
          if (path.isBlockStatement()) {
            yield types.blockStatement([]);
          }
        },
      });
      const catchAllMutantPlacer: MutantPlacer<babel.types.Program> = {
        name: 'catchAllMutantPlacer',
        canPlace: (path) => path.isProgram(),
        place() {
          /* Idle */
        },
      };
      mutantPlacers.push(catchAllMutantPlacer);
    });

    function range(startLine: number, startColumn: number, endLine: number, endColumn: number): MutateDescription {
      return [
        {
          start: { line: startLine, column: startColumn },
          end: { line: endLine, column: endColumn },
        },
      ];
    }

    it('should mutate a node that matches the a single line range', () => {
      context.mutateDescription = range(2, 12, 2, 15);
      act(ast);
      expect(mutantCollector.mutants).lengthOf(1);
      expect(mutantCollector.mutants[0].original.loc?.start.line).eq(2);
    });

    it('should not mutate a node that does not match a single line start range', () => {
      context.mutateDescription = range(2, 13, 2, 15);
      act(ast);
      expect(mutantCollector.mutants).lengthOf(0);
    });

    it('should not mutate a node that does not match a single line end range', () => {
      context.mutateDescription = range(2, 12, 2, 14);
      act(ast);
      expect(mutantCollector.mutants).lengthOf(0);
    });

    it('should mutate a node that matches a multi line range', () => {
      context.mutateDescription = range(3, 0, 7, 0);
      act(ast);
      expect(mutantCollector.mutants).lengthOf(1);
      expect(mutantCollector.mutants[0].mutatorName).eq('blockMutatorForTest');
    });

    it('should not mutate a node that is not in the start line range', () => {
      context.mutateDescription = range(4, 0, 7, 0);
      act(ast);
      expect(mutantCollector.mutants).lengthOf(0);
    });

    it('should not mutate a node that is not in the end line range', () => {
      context.mutateDescription = range(3, 0, 6, 0);
      act(ast);
      expect(mutantCollector.mutants).lengthOf(0);
    });
  });

  describe('header', () => {
    it('should add the global js header on top but after comments that are followed by newline', () => {
      const ast = createJSAst({ rawContent: '// @flow\n// another comment\n\nconst foo="cat"' });
      act(ast);
      expect(ast.root.program.body[0].leadingComments![0].value).eq(' @flow');
      expect(ast.root.program.body[0].leadingComments![1].value).eq(' another comment');
      const [{ leadingComments: _unused, ...actualFirstStatement }] = ast.root.program.body;
      const [{ leadingComments: _unused2, ...expectedFirstStatement }] = instrumentationBabelHeader;
      expect(actualFirstStatement).deep.eq(expectedFirstStatement);
      expect(ast.root.program.body.slice(1, instrumentationBabelHeader.length)).deep.eq(instrumentationBabelHeader.slice(1));
    });

    it('should add the global js header on top but after comments that are followed by a statement', () => {
      const ast = createJSAst({ rawContent: '// @flow\n// another comment\nconst foo="cat"' });
      act(ast);

      expect(ast.root.program.body[0].leadingComments![0].value).eq(' @flow');
      expect(ast.root.program.body[0].leadingComments![1].value).eq(' another comment');
      const [{ leadingComments: _unused, ...actualFirstStatement }] = ast.root.program.body;
      const [{ leadingComments: _unused2, ...expectedFirstStatement }] = instrumentationBabelHeader;
      expect(actualFirstStatement).deep.eq(expectedFirstStatement);
      expect(ast.root.program.body.slice(1, instrumentationBabelHeader.length)).deep.eq(instrumentationBabelHeader.slice(1));
    });

    it('should not add global js header if no mutants were placed in the code', () => {
      const ast = createJSAst({ originFileName: 'foo.js', rawContent: 'const bar = baz' }); // no mutants
      act(ast);
      expect(ast.root.program.body).lengthOf(1);
    });
  });

  describe('ignorers', () => {
    it('mutants should have ignore reason when using console.log ignorer', () => {
      const ast = createJSAst({ rawContent: 'console.log(foo + bar)' });
      context.options.ignorers.push({ shouldIgnore: () => 'console.log' });
      act(ast);
      expect(mutantCollector.mutants).lengthOf(2);
      expect(mutantCollector.mutants[0].ignoreReason).eq('console.log');
      expect(mutantCollector.mutants[1].ignoreReason).eq('console.log');
    });
  });

  function act(ast: ScriptAst) {
    (transformBabel as (...args: [...Parameters<AstTransformer<ScriptFormat>>, mutators: NodeMutator[], mutantPlacers: MutantPlacer[]]) => void)(
      ast,
      mutantCollector,
      context,
      mutators,
      mutantPlacers,
    );
  }
});
