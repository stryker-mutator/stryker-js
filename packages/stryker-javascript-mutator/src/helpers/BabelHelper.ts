import * as types from '@babel/types';
import { parse, ParserOptions } from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
import generate from '@babel/generator';
import { NodeWithParent } from './ParentNode';

export default class BabelHelper {

  public static parse(code: string): types.File {
    return parse(code, this.createOptions());
  }

  private static createOptions(): ParserOptions {
    return {
      plugins: [
        'asyncGenerators',
        'bigInt',
        'classProperties',
        'dynamicImport',
        'flow',
        'jsx',
        'objectRestSpread'
      ],
      sourceType: 'unambiguous'
    };
  }

  public static getNodes(ast: types.File): NodeWithParent[] {
    const nodes: NodeWithParent[] = [];

    traverse(ast, {
      enter(path: NodePath<types.Node>) {
        const node: NodeWithParent = path.node;
        node.parent = path.parent as any;
        Object.freeze(node);
        nodes.push(node);
      },

    });

    return nodes;
  }

  public static generateCode(ast: types.Node) {
    return generate(ast).code;
  }

}
