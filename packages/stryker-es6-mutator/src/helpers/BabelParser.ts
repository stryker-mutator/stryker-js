import * as babel from 'babel-core';
import { NodePath } from 'babel-traverse';

export default class BabelParser {
  static getAst(code: string): babel.types.File {
    return babel.transform(code).ast as babel.types.File;
  }

  static getNodes(ast: babel.types.File): babel.types.Node[] {
    const nodes: babel.types.Node[] = [];

    babel.traverse(ast, {
      enter(path: NodePath<babel.types.Node>) {
        const node = path.node;
        Object.freeze(node);
        nodes.push(node);
      }
    });

    return nodes;
  }

  static generateCode(ast: babel.types.File, node: babel.Node) {
    ast.program.body = [node as any];
    return babel.transformFromAst(ast).code;
  }

  static removeUseStrict(ast: babel.types.File) {
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