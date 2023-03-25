import babel, { type NodePath } from '@babel/core';
import generator from '@babel/generator';
import { normalizeWhitespaces } from '@stryker-mutator/util';
import { expect } from 'chai';

import { switchCaseMutantPlacer as sut } from '../../../src/mutant-placers/switch-case-mutant-placer.js';
import { createMutant } from '../../helpers/factories.js';
import { findNodePath, parseJS } from '../../helpers/syntax-test-helpers.js';

// @ts-expect-error CJS typings not in line with synthetic esm
const generate: typeof generator = generator.default;
const { types } = babel;

describe('switchCaseMutantPlacer', () => {
  it('should have the correct name', () => {
    expect(sut.name).eq('switchCaseMutantPlacer');
  });

  describe(sut.canPlace.name, () => {
    it('should be false on non-switch-case nodes', () => {
      [
        findNodePath(parseJS('foo + bar'), (p) => p.isBinaryExpression()),
        findNodePath(parseJS('switch(foo) { }'), (p) => p.isSwitchStatement()),
      ].forEach((node) => {
        expect(sut.canPlace(node)).false;
      });
    });

    it('should be true on a SwitchCase node', () => {
      const switchCase = findNodePath(parseJS('switch(foo) { case "bar": console.log("bar"); break; }'), (p) => p.isSwitchCase());
      expect(sut.canPlace(switchCase)).true;
    });
  });

  describe(sut.place.name, () => {
    let ast: babel.types.File;
    let switchCase: NodePath<babel.types.SwitchCase>;

    beforeEach(() => {
      ast = parseJS('switch(foo) { case "bar": console.log("bar"); break; }');
      switchCase = findNodePath(ast, (p) => p.isSwitchCase());
    });

    it('should place a mutant in the "consequent" part of a switch-case', () => {
      // Arrange
      const mutant = createMutant({ id: '42', original: switchCase.node, replacement: types.switchCase(types.stringLiteral('bar'), []) });
      const appliedMutants = new Map([[mutant, mutant.applied(switchCase.node)]]);

      // Act
      sut.place(switchCase, appliedMutants);
      const actualCode = normalizeWhitespaces(generate(ast).code);

      // Assert
      expect(actualCode).contains(normalizeWhitespaces('switch (foo) { case "bar": if (stryMutAct_9fa48("42"))'));
    });

    it('should place the original code as alternative (inside `else`)', () => {
      // Arrange
      const mutant = createMutant({ id: '42', original: switchCase.node, replacement: types.switchCase(types.stringLiteral('bar'), []) });
      const appliedMutants = new Map([[mutant, mutant.applied(switchCase.node)]]);

      // Act
      sut.place(switchCase, appliedMutants);
      const actualCode = normalizeWhitespaces(generate(ast).code);

      // Assert
      expect(actualCode).matches(/else {.* console\.log\("bar"\); break; }/);
    });

    it('should add mutant coverage syntax', () => {
      // Arrange
      const mutant = createMutant({ id: '42', original: switchCase.node, replacement: types.switchCase(types.stringLiteral('bar'), []) });
      const appliedMutants = new Map([[mutant, mutant.applied(switchCase.node)]]);

      // Act
      sut.place(switchCase, appliedMutants);
      const actualCode = normalizeWhitespaces(generate(ast).code);

      // Assert
      expect(actualCode).matches(/else\s*{\s*stryCov_9fa48\("42"\)/);
    });

    it('should be able to place multiple mutants', () => {
      // Arrange
      const mutants = [
        createMutant({ id: '42', original: switchCase.node, replacement: types.switchCase(types.stringLiteral('bar'), []) }),
        createMutant({
          id: '156',
          original: switchCase.node,
          replacement: types.switchCase(types.stringLiteral('bar'), [types.expressionStatement(types.callExpression(types.identifier('foo'), []))]),
        }),
      ];
      const appliedMutants = new Map([
        [mutants[0], mutants[0].applied(switchCase.node)],
        [mutants[1], mutants[1].applied(switchCase.node)],
      ]);

      // Act
      sut.place(switchCase, appliedMutants);
      const actualCode = normalizeWhitespaces(generate(ast).code);

      // Assert
      expect(actualCode).contains(
        normalizeWhitespaces(`if (stryMutAct_9fa48("156")) {
            foo();
            } else if (stryMutAct_9fa48("42")) {}
            else {
              stryCov_9fa48("42", "156")`)
      );
    });
  });
});
