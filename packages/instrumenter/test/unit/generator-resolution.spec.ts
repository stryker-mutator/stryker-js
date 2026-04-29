import generator from '@babel/generator';
import babel from '@babel/core';
import { expect } from 'chai';

const { types } = babel;

const generate = generator.default ?? generator;

describe('generator resolution', () => {
  it('should resolve generate as a callable function', () => {
    expect(generate).to.be.a('function');
  });

  it('should generate code from a simple AST node', () => {
    const node = types.binaryExpression(
      '+',
      types.numericLiteral(1),
      types.numericLiteral(2),
    );
    const result = generate(node);
    expect(result).to.have.property('code');
    expect(result.code).to.eq('1 + 2');
  });

  it('should generate code from a full program AST', () => {
    const program = types.file(
      types.program([
        types.variableDeclaration('const', [
          types.variableDeclarator(
            types.identifier('x'),
            types.numericLiteral(42),
          ),
        ]),
      ]),
      undefined,
      undefined,
    );
    const result = generate(program);
    expect(result.code).to.eq('const x = 42;');
  });

  it('should fall back to generator itself when default is undefined', () => {
    // Simulate what happens when there is no `.default` property (e.g. Bun runtime)
    const mockGenerate = (_node: babel.types.Node) => ({ code: 'mocked' });
    const mockModule = { default: undefined } as unknown as {
      default?: typeof mockGenerate;
    };
    const resolved = mockModule.default ?? mockGenerate;
    expect(resolved).to.be.a('function');
    expect(resolved(types.numericLiteral(1)).code).to.eq('mocked');
  });

  it('should prefer .default when it is defined', () => {
    // Simulate Node.js CJS interop where `.default` exists
    const defaultFn = (_node: babel.types.Node) => ({ code: 'from-default' });
    const moduleFn = (_node: babel.types.Node) => ({ code: 'from-module' });
    const mockModule = Object.assign(moduleFn, {
      default: defaultFn,
    }) as unknown as { default?: typeof defaultFn };
    const resolved = mockModule.default ?? moduleFn;
    expect(resolved(types.numericLiteral(1)).code).to.eq('from-default');
  });
});
