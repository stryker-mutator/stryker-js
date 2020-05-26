import { expect } from 'chai';
import { types } from '@babel/core';
import generate from '@babel/generator';
import { normalizeWhitespaces } from '@stryker-mutator/util';

import { switchCaseMutantPlacer } from '../../../src/mutant-placers/switch-case-mutant-placer';
import { findNodePath, parseJS } from '../../helpers/syntax-test-helpers';
import { Mutant } from '../../../src/mutant';

describe(switchCaseMutantPlacer.name, () => {
  it('should have the correct name', () => {
    expect(switchCaseMutantPlacer.name).eq('switchCaseMutantPlacer');
  });

  it("shouldn't place mutants on anything but a statement", () => {
    [
      findNodePath(parseJS('foo + bar'), (p) => p.isBinaryExpression()),
      findNodePath(parseJS('foo = bar'), (p) => p.isAssignmentExpression()),
      findNodePath(parseJS('foo.bar()'), (p) => p.isCallExpression()),
    ].forEach((node) => {
      expect(switchCaseMutantPlacer(node, [])).false;
    });
  });

  it('should place mutants in a statement', () => {
    // Arrange
    const ast = parseJS('const foo = a + b');
    const statement = findNodePath(ast, (p) => p.isVariableDeclaration());
    const nodeToMutate = findNodePath<types.BinaryExpression>(ast, (p) => p.isBinaryExpression());
    const mutant = new Mutant(
      1,
      nodeToMutate.node,
      types.binaryExpression('>>>', types.identifier('bar'), types.identifier('baz')),
      'file.js',
      'fooMutator'
    );

    // Act
    const actual = switchCaseMutantPlacer(statement, [mutant]);

    // Assert
    expect(actual).true;
    expect(normalizeWhitespaces(generate(ast).code)).eq(
      normalizeWhitespaces(`{
      switch (__global_69fa48.activeMutant) {
        case 1:
          const foo = bar >>> baz;
          break;
      default:
          __global_69fa48.__coverMutant__(1);
          const foo = a + b;
           break;
        }
      }`)
    );
  });
});
