import * as types from '@babel/types';
import { parse, ParseOptions } from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
import generate from '@babel/generator';
import { NodeWithParent } from './ParentNode';

export default class BabelParser {
  public static getAst(code: string): types.File {
    const options: ParseOptions = {
      sourceType: 'unambiguous',
      plugins: [
        'jsx',
        'flow',
        'objectRestSpread',
        'classProperties',
        'asyncGenerators',
        'dynamicImport'
      ],
      sourceType: 'script'
    };

    return parse(code, options);
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

  public static generateCode(ast: types.File, node: types.Node) {
    ast.program.body = [node as any];
    return generate(ast).code;
  }

  public static removeUseStrict(ast: types.File) {
    if (ast.program.directives) {
      const directives = ast.program.directives;
      directives.forEach((directive, index) => {
        if (directive.value.value === 'use strict') {
          directives.splice(index, 1);
        }
      });
    }
  }
}
