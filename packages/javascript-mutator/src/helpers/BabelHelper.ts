import * as types from '@babel/types';
import { parse, ParserOptions } from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
import generate from '@babel/generator';
import { NodeWithParent } from './ParentNode';
import { ParserPlugin } from '@babel/parser';

export default class BabelHelper {

  public static parse(code: string, plugins?: ParserPlugin[]): types.File {
    return parse(code, this.createOptions(plugins || []));
  }

  private static createOptions(options: ParserPlugin[]): ParserOptions {
    return {
      plugins: [
        'asyncGenerators',
        'bigInt',
        'classProperties',
        'dynamicImport',
        'flow',
        'jsx',
        'objectRestSpread',
        ['decorators', { decoratorsBeforeExport: true }] as any,
        ...options
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
