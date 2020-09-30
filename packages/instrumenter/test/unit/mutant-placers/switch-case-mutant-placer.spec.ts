import { NodePath, types } from '@babel/core';
import generate from '@babel/generator';
import { normalizeWhitespaces } from '@stryker-mutator/util';
import { expect } from 'chai';

import { switchCaseMutantPlacer as sut } from '../../../src/mutant-placers/switch-case-mutant-placer';
import { createMutant } from '../../helpers/factories';
import { findNodePath, parseJS } from '../../helpers/syntax-test-helpers';

describe(sut.name, () => {
  it('should have the correct name', () => {
    expect(sut.name).eq('switchCaseMutantPlacer');
  });

  it('should not place mutants on non-switch-case nodes', () => {
    [
      findNodePath(parseJS('foo + bar'), (p) => p.isBinaryExpression()),
      findNodePath(parseJS('switch(foo) { }'), (p) => p.isSwitchStatement()),
    ].forEach((node) => {
      expect(sut(node, [])).false;
    });
  });

  it('should only place SwitchCase nodes', () => {
    const switchCase = findNodePath(parseJS('switch(foo) { case "bar": console.log("bar"); break; }'), (p) => p.isSwitchCase());
    const mutant = createMutant({ original: switchCase.node, replacement: types.stringLiteral('foo') });
    expect(() => sut(switchCase, [mutant])).throws('switchCaseMutantPlacer can only place SwitchCase syntax');
  });

  describe('given a SwitchCase node', () => {
    let ast: types.File;
    let switchCase: NodePath;

    beforeEach(() => {
      ast = parseJS('switch(foo) { case "bar": console.log("bar"); break; }');
      switchCase = findNodePath(ast, (p) => p.isSwitchCase());
    });

    it('should place a mutant in the "consequent" part of a switch-case', () => {
      // Arrange
      const mutant = createMutant({ id: 42, original: switchCase.node, replacement: types.switchCase(types.stringLiteral('bar'), []) });

      // Act
      const actual = sut(switchCase, [mutant]);
      const actualCode = normalizeWhitespaces(generate(ast).code);

      // Assert
      expect(actual).true;
      expect(actualCode).contains(normalizeWhitespaces('switch (foo) { case "bar": if (stryMutAct_9fa48(42))'));
    });

    it('should place the original code as alternative (inside `else`)', () => {
      // Arrange
      const mutant = createMutant({ id: 42, original: switchCase.node, replacement: types.switchCase(types.stringLiteral('bar'), []) });

      // Act
      const actual = sut(switchCase, [mutant]);
      const actualCode = normalizeWhitespaces(generate(ast).code);

      // Assert
      expect(actual).true;
      expect(actualCode).matches(/else {.* console\.log\("bar"\); break; }/);
    });

    it('should add mutant coverage syntax', () => {
      // Arrange
      const mutant = createMutant({ id: 42, original: switchCase.node, replacement: types.switchCase(types.stringLiteral('bar'), []) });

      // Act
      const actual = sut(switchCase, [mutant]);
      const actualCode = normalizeWhitespaces(generate(ast).code);

      // Assert
      expect(actual).true;
      expect(actualCode).matches(/else\s*{\s*stryCov_9fa48\(42\)/);
    });

    it('should be able to place multiple mutants', () => {
      // Arrange
      const mutants = [
        createMutant({ id: 42, original: switchCase.node, replacement: types.switchCase(types.stringLiteral('bar'), []) }),
        createMutant({
          id: 156,
          original: switchCase.node,
          replacement: types.switchCase(types.stringLiteral('bar'), [types.expressionStatement(types.callExpression(types.identifier('foo'), []))]),
        }),
      ];

      // Act
      sut(switchCase, mutants);
      const actualCode = normalizeWhitespaces(generate(ast).code);

      // Assert
      expect(actualCode).contains(
        normalizeWhitespaces(`if (stryMutAct_9fa48(156)) {
          foo();
          } else if (stryMutAct_9fa48(42)) {} 
          else {
            stryCov_9fa48(42, 156)`)
      );
    });
  });
});
