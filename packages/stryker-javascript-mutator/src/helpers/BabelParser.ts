import * as babel from 'babel-core';
import * as babylon from 'babylon';
import generate from 'babel-generator';
import { NodePath } from 'babel-traverse';
import { NodeWithParent } from './ParentNode';

export default class BabelParser {
  public static getAst(code: string): babel.types.File {
    let ast: babel.types.File;

    const options: babylon.BabylonOptions = {
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

    try {
      ast = babylon.parse(code, options);
    } catch {
      options.sourceType = 'module';
      ast = babylon.parse(code, options);
    }
    return ast;
  }

  public static getNodes(ast: babel.types.File): NodeWithParent[] {
    const nodes: NodeWithParent[] = [];

    babel.traverse(ast, {
      enter(path: NodePath<babel.types.Node>) {
        const node: NodeWithParent = path.node;
        node.parent = path.parent;
        Object.freeze(node);
        nodes.push(node);
      }
    });

    return nodes;
  }

  public static generateCode(ast: babel.types.File, node: babel.Node) {
    ast.program.body = [node as any];
    return generate(ast).code;
  }

  public static removeUseStrict(ast: babel.types.File) {
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
