import sinon from 'sinon';
import { expect } from 'chai';
import { types, NodePath } from '@babel/core';
import generate from '@babel/generator';

import { transformerContextStub } from '../../helpers/stubs';
import { TransformerContext } from '../../../src/transformers';
import * as mutators from '../../../src/mutators';
import * as mutantPlacers from '../../../src/mutant-placers';
import { MutantCollector } from '../../../src/transformers/mutant-collector';
import { transformBabel } from '../../../src/transformers/babel-transformer';
import { createJSAst, createNamedNodeMutation, createMutant, createTSAst } from '../../helpers/factories';
import { declareGlobal } from '../../../src/util/syntax-helpers';

describe('babel-transformer', () => {
  let context: sinon.SinonStubbedInstance<TransformerContext>;
  let mutateStub: sinon.SinonStubbedMember<typeof mutators.mutate>;
  let mutantPlacerStub: sinon.SinonStubbedMember<typeof mutantPlacers.placeMutant>;
  let mutantCollectorMock: sinon.SinonStubbedInstance<MutantCollector>;

  beforeEach(() => {
    context = transformerContextStub();
    mutateStub = sinon.stub(mutators, 'mutate');
    mutantPlacerStub = sinon.stub(mutantPlacers, 'placeMutant');
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

  it('should add the global stuff on top', () => {
    const ast = createJSAst({ rawContent: 'foo' });
    transformBabel(ast, mutantCollectorMock, context);
    expect(ast.root.program.body[0]).eq(declareGlobal);
  });

  it('should skip type annotations', () => {
    const ast = createTSAst({ rawContent: 'const foo: string;' });
    transformBabel(ast, mutantCollectorMock, context);
    // @ts-expect-error
    expectMutateNotCalledWith((t) => t.isTSTypeAnnotation());
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

  function expectMutateNotCalledWith(predicate: (nodePath: NodePath) => boolean) {
    mutateStub.getCalls().forEach((call) => {
      const nodePath: NodePath = call.args[0];
      if (predicate(nodePath)) {
        expect.fail(`Mutate called with node "${generate(nodePath.node).code}", but not expected`);
      }
    });
  }
});
