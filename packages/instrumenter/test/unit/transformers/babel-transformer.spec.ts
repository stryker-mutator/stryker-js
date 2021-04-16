import sinon from 'sinon';
import { expect } from 'chai';
import { types, NodePath } from '@babel/core';
import generate from '@babel/generator';

import { normalizeWhitespaces } from '@stryker-mutator/util';

import { transformerContextStub } from '../../helpers/stubs';
import { TransformerContext } from '../../../src/transformers';
import * as mutators from '../../../src/mutators';
import * as mutantPlacers from '../../../src/mutant-placers';
import { MutantCollector } from '../../../src/transformers/mutant-collector';
import { transformBabel } from '../../../src/transformers/babel-transformer';
import { createJSAst, createNamedNodeMutation, createMutant, createTSAst } from '../../helpers/factories';
import { instrumentationBabelHeader } from '../../../src/util/syntax-helpers';
import { JSAst } from '../../../src/syntax';
import { NamedNodeMutation } from '../../../src/mutant';

describe('babel-transformer', () => {
  let context: sinon.SinonStubbedInstance<TransformerContext>;
  let mutateStub: sinon.SinonStubbedMember<typeof mutators.mutate>;
  let mutantPlacerStub: sinon.SinonStubbedMember<typeof mutantPlacers.placeMutants>;
  let mutantCollectorMock: sinon.SinonStubbedInstance<MutantCollector>;

  beforeEach(() => {
    context = transformerContextStub();
    mutateStub = sinon.stub(mutators, 'mutate');
    mutantPlacerStub = sinon.stub(mutantPlacers, 'placeMutants');
    mutantCollectorMock = sinon.createStubInstance(MutantCollector);
    mutateStub.returns([]);
  });

  it('should allow mutators to mutate nodes and add mutants to the mutant collector', () => {
    // Arrange
    const ast = createJSAst({ rawContent: 'foo' });
    const mutant = createNamedNodeMutation({ original: types.identifier('first') });
    const mutant2 = createNamedNodeMutation({ original: types.identifier('second') });
    mutateStub.onFirstCall().returns([mutant]).onThirdCall().returns([mutant2]);

    // Act
    transformBabel(ast, mutantCollectorMock, context);

    // Assert
    expect(mutantCollectorMock.add).calledTwice;
    expect(mutantCollectorMock.add).calledWith(ast.originFileName, mutant);
    expect(mutantCollectorMock.add).calledWith(ast.originFileName, mutant2);
    expect(mutateStub).calledThrice;
  });

  it('should place mutants', () => {
    // Arrange
    const ast = createJSAst({ rawContent: 'foo' });
    const mutant = createMutant();
    mutantCollectorMock.findUnplacedMutantsInScope.returns([]).onThirdCall().returns([mutant]);
    mutantPlacerStub.returns(true);

    // Act
    transformBabel(ast, mutantCollectorMock, context);

    // Assert
    expect(mutantPlacerStub).calledWith(sinon.match.object, [mutant]);
  });

  it('should place mutants in variable declarations', () => {
    // Arrange
    const ast = createJSAst({ rawContent: 'const foo = "bar" ' });
    transformBabel(ast, mutantCollectorMock, context);
    expectMutateCalledWith((t) => t.isVariableDeclaration());
    expectMutateCalledWith((t) => t.isStringLiteral());
  });

  it('should mark placed mutants as placed in the mutant collector', () => {
    // Arrange
    const ast = createJSAst({ rawContent: 'foo' });
    const mutant = createMutant();
    mutantCollectorMock.findUnplacedMutantsInScope.returns([]).onThirdCall().returns([mutant]);
    mutantPlacerStub.onThirdCall().returns(true);

    // Act
    transformBabel(ast, mutantCollectorMock, context);

    // Assert
    expect(mutantCollectorMock.markMutantsAsPlaced).calledOnce;
    expect(mutantCollectorMock.markMutantsAsPlaced).calledWith([mutant]);
  });

  it('should add the global js header on top', () => {
    const ast = createJSAst({ rawContent: 'const foo="cat"' });
    mutantCollectorMock.hasPlacedMutants.returns(true);
    transformBabel(ast, mutantCollectorMock, context);
    expect(ast.root.program.body.slice(0, instrumentationBabelHeader.length)).deep.eq(instrumentationBabelHeader);
  });

  it('should add the global js header on top but after comments that are followed by newline', () => {
    const ast = createJSAst({ rawContent: '// @flow\n// another comment\n\nconst foo="cat"' });
    mutantCollectorMock.hasPlacedMutants.returns(true);
    transformBabel(ast, mutantCollectorMock, context);

    expect(ast.root.program.body[0].leadingComments![0].value).eq(' @flow');
    expect(ast.root.program.body[0].leadingComments![1].value).eq(' another comment');
    const { leadingComments: _unused, ...actualFirstStatement } = ast.root.program.body[0];
    const { leadingComments: _unused2, ...expectedFirstStatement } = instrumentationBabelHeader[0];
    expect(actualFirstStatement).deep.eq(expectedFirstStatement);
    expect(ast.root.program.body.slice(1, instrumentationBabelHeader.length)).deep.eq(instrumentationBabelHeader.slice(1));
  });

  it('should add the global js header on top but after comments that are followed by a statement', () => {
    const ast = createJSAst({ rawContent: '// @flow\n// another comment\nconst foo="cat"' });
    mutantCollectorMock.hasPlacedMutants.returns(true);
    transformBabel(ast, mutantCollectorMock, context);

    expect(ast.root.program.body[0].leadingComments![0].value).eq(' @flow');
    expect(ast.root.program.body[0].leadingComments![1].value).eq(' another comment');
    const { leadingComments: _unused, ...actualFirstStatement } = ast.root.program.body[0];
    const { leadingComments: _unused2, ...expectedFirstStatement } = instrumentationBabelHeader[0];
    expect(actualFirstStatement).deep.eq(expectedFirstStatement);
    expect(ast.root.program.body.slice(1, instrumentationBabelHeader.length)).deep.eq(instrumentationBabelHeader.slice(1));
  });

  it('should not add global js header if no mutants were placed in the code', () => {
    const ast = createJSAst({ originFileName: 'foo.js', rawContent: 'foo' });
    mutantCollectorMock.hasPlacedMutants.returns(false);
    transformBabel(ast, mutantCollectorMock, context);
    expect(mutantCollectorMock.hasPlacedMutants).calledWith('foo.js');
    expect(ast.root.program.body).lengthOf(1);
  });

  describe('types', () => {
    it('should skip type annotations', () => {
      const ast = createTSAst({ rawContent: 'const foo: string;' });
      transformBabel(ast, mutantCollectorMock, context);
      expectMutateNotCalledWith((t) => t.isTSTypeAnnotation());
    });

    it('should skip `as` expressions', () => {
      const ast = createTSAst({ rawContent: 'let foo = "bar" as "bar"' });
      transformBabel(ast, mutantCollectorMock, context);
      expectMutateNotCalledWith((t) => t.isTSLiteralType());
      expectMutateNotCalledWith((t) => t.isStringLiteral() && t.parentPath.isTSLiteralType());
    });

    it('should skip TSDeclareFunction statements', () => {
      const ast = createTSAst({ rawContent: 'declare function foo(): "foo";' });
      transformBabel(ast, mutantCollectorMock, context);
      expectMutateNotCalledWith((t) => t.isTSDeclareFunction());
      expectMutateNotCalledWith((t) => t.isStringLiteral());
    });

    it('should skip `declare const foo: "foo"` statements', () => {
      const ast = createTSAst({ rawContent: 'declare const foo: "foo";' });
      transformBabel(ast, mutantCollectorMock, context);
      expectMutateNotCalledWith((t) => t.isVariableDeclaration());
      expectMutateNotCalledWith((t) => t.isStringLiteral());
    });

    it('should skip generic parameters', () => {
      const ast = createTSAst({ rawContent: 'React.useState<string | false>()' });
      transformBabel(ast, mutantCollectorMock, context);
      expectMutateNotCalledWith((t) => t.isTSTypeParameterInstantiation());
    });
  });

  it('should skip import declarations', () => {
    const ast = createTSAst({ rawContent: "import a from 'b'" });
    transformBabel(ast, mutantCollectorMock, context);
    expectMutateNotCalledWith((t) => t.isImportDeclaration());
    expectMutateNotCalledWith((t) => t.isStringLiteral());
  });

  it('should skip decorators', () => {
    const ast = createTSAst({ rawContent: '@Component() class A {}' });
    transformBabel(ast, mutantCollectorMock, context);
    expectMutateNotCalledWith((t) => t.isDecorator());
  });

  describe('with mutationRanges', () => {
    let ast: JSAst;
    let mutant: NamedNodeMutation;

    beforeEach(() => {
      ast = createJSAst({
        originFileName: 'foo.js',
        rawContent:
          'console.log("line 1");\n' +
          'console.log("line 2");\n' +
          '{\n' +
          'console.log("line 4");\n' +
          'console.log("line 5");\n' +
          '}\n' +
          'console.log("line 6");\n',
      });
      mutant = createNamedNodeMutation({ original: types.identifier('first') });
      mutateStub.onFirstCall().returns([mutant]);
    });

    function range(startLine: number, startColumn: number, endLine: number, endColumn: number, fileName = 'foo.js') {
      return {
        fileName,
        start: { line: startLine, column: startColumn },
        end: { line: endLine, column: endColumn },
      };
    }

    it('should mutate a node that matches the a single line range', () => {
      context.options.mutationRanges = [range(4, 12, 4, 20)];
      transformBabel(ast, mutantCollectorMock, context);
      expect(mutateStub.firstCall.args[0].toString()).eq('"line 4"');
    });

    it('should not mutate a node that does not match a single line start range', () => {
      context.options.mutationRanges = [range(4, 13, 4, 20)];
      transformBabel(ast, mutantCollectorMock, context);
      expect(mutateStub).not.called;
    });

    it('should not mutate a node that does not match a single line end range', () => {
      context.options.mutationRanges = [range(4, 12, 4, 19)];
      transformBabel(ast, mutantCollectorMock, context);
      expect(mutateStub).not.called;
    });

    it('should mutate a node that matches a multi line range', () => {
      context.options.mutationRanges = [range(3, 0, 7, 0)];
      transformBabel(ast, mutantCollectorMock, context);
      expect(normalizeWhitespaces(mutateStub.firstCall.args[0].toString())).eq('{ console.log("line 4"); console.log("line 5"); }');
      expect(normalizeWhitespaces(mutateStub.secondCall.args[0].toString())).eq('console.log("line 4");');
    });

    it('should not mutate a node is not in the start line range', () => {
      context.options.mutationRanges = [range(4, 0, 7, 0)];
      transformBabel(ast, mutantCollectorMock, context);
      mutateStub.getCalls().forEach((call) => {
        expect(normalizeWhitespaces(call.args[0].toString())).not.eq('{ console.log("line 4"); console.log("line 5"); }');
      });
    });

    it('should not mutate a node is not in the end line range', () => {
      context.options.mutationRanges = [range(2, 0, 6, 0)];
      transformBabel(ast, mutantCollectorMock, context);
      mutateStub.getCalls().forEach((call) => {
        expect(normalizeWhitespaces(call.args[0].toString())).not.eq('{ console.log("line 4"); console.log("line 5"); }');
      });
    });

    it('should still mutate other files', () => {
      context.options.mutationRanges = [range(100, 0, 101, 0, 'bar.js')];
      transformBabel(ast, mutantCollectorMock, context);
      expect(mutantCollectorMock.add).calledWith('foo.js', mutant);
    });
  });

  function expectMutateNotCalledWith(predicate: (nodePath: NodePath) => boolean) {
    mutateStub.getCalls().forEach((call) => {
      const nodePath: NodePath = call.args[0];
      if (predicate(nodePath)) {
        expect.fail(`Mutate called with node "${generate(nodePath.node).code}", but not expected`);
      }
    });
  }
  function expectMutateCalledWith(predicate: (nodePath: NodePath) => boolean) {
    expect(
      mutateStub.getCalls().some((call) => {
        const nodePath: NodePath = call.args[0];
        return predicate(nodePath);
      }),
      `Mutate not called with ${predicate.toString()}`
    ).true;
  }
});
