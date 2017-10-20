import * as babel from 'babel-core';
import { NodePath } from 'babel-traverse';
import { IdentifiedNode } from '../IdentifiedNode';

export default class BabelParser {
  static getAst(code: string): babel.types.File {
    return babel.transform(code).ast as babel.types.File;
  }

  static getNodes(ast: babel.types.File): IdentifiedNode[] {
    const nodes: IdentifiedNode[] = [];

    babel.traverse(ast, {
      enter(path: NodePath<IdentifiedNode>) {
        const node = path.node;
        node.nodeID = nodes.length;
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