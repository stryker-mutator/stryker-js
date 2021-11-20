import { expect } from 'chai';

import * as syntaxHelpers from '../../../src/util/syntax-helpers';
import { findNodePath, parseTS } from '../../helpers/syntax-test-helpers';

describe('syntax-helpers', () => {
  describe('instrumentationBabelHeader', () => {
    it('should be immutable', () => {
      expect(syntaxHelpers.instrumentationBabelHeader).frozen;
      expect(syntaxHelpers.instrumentationBabelHeader[0].leadingComments).frozen;
    });
  });

  describe('isTypeNode', () => {
    it('should identify type assertions ("as")', async () => {
      const input = findNodePath(parseTS('const foo = { bar: "baz" } as const'), (p) => p.isTSAsExpression());
      expect(syntaxHelpers.isTypeNode(input)).true;
    });

    it('should identify interface declarations', async () => {
      const input = findNodePath(parseTS('interface Foo {}'), (p) => p.isTSInterfaceDeclaration());
      expect(syntaxHelpers.isTypeNode(input)).true;
    });

    it('should identify type annotations', async () => {
      const input = findNodePath(parseTS('const foo: bar = baz;'), (p) => p.isTSTypeAnnotation());
      expect(syntaxHelpers.isTypeNode(input)).true;
    });

    it('should identify type alias declarations', async () => {
      const input = findNodePath(parseTS('type Foo = "bar"'), (p) => p.isTSTypeAliasDeclaration());
      expect(syntaxHelpers.isTypeNode(input)).true;
    });

    it('should be false for module declarations', async () => {
      const input = findNodePath(parseTS('namespace A { }'), (p) => p.isTSModuleDeclaration());
      expect(syntaxHelpers.isTypeNode(input)).false;
    });

    it('should identify TS enum declarations', async () => {
      const input = findNodePath(parseTS('enum A { B }'), (p) => p.isTSEnumDeclaration());
      expect(syntaxHelpers.isTypeNode(input)).true;
    });

    it('should identify TS declare function syntax', async () => {
      const input = findNodePath(parseTS('declare function foo(): void;'), (p) => p.isTSDeclareFunction());
      expect(syntaxHelpers.isTypeNode(input)).true;
    });

    it('should identify TS generic type parameter instantiations', async () => {
      const input = findNodePath(parseTS('foo<"test">()'), (p) => p.isTSTypeParameterInstantiation());
      expect(syntaxHelpers.isTypeNode(input)).true;
    });

    it('should identify TS generic type parameters declarations', async () => {
      const input = findNodePath(parseTS('function foo<bar extends `${position} ${color}`>() { }'), (p) => p.isTSTypeParameterDeclaration());
      expect(syntaxHelpers.isTypeNode(input)).true;
    });
  });
});
