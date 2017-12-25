import * as babel from 'babel-core';
import * as babylon from 'babylon';
import generate from 'babel-generator';
import { NodePath } from 'babel-traverse';

export default class BabelParser {
  static getAst(code: string): babel.types.File {
    let ast: babel.types.File;
    
    const options: babylon.BabylonOptions = {
      sourceType: 'script',
      plugins: [
        'jsx',
        'flow'
      ]
    };

    try {
      ast = babylon.parse(code, options);
    } catch {
      options.sourceType = 'module';
      ast = babylon.parse(code, options);
    }
    return ast;
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
    return generate(ast).code;
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