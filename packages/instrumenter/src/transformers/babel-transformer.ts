import { traverse } from '@babel/core';

/* eslint-disable @typescript-eslint/no-duplicate-imports */
// @ts-expect-error The babel types don't define "File" yet
import { File } from '@babel/core';
/* eslint-enable @typescript-eslint/no-duplicate-imports */

import { placeMutants } from '../mutant-placers';
import { mutate } from '../mutators';
import { instrumentationBabelHeader, isTypeNode, isImportDeclaration } from '../util/syntax-helpers';
import { AstFormat } from '../syntax';

import { AstTransformer } from '.';

export const transformBabel: AstTransformer<AstFormat.JS | AstFormat.TS> = ({ root, originFileName, rawContent }, mutantCollector, { options }) => {
  // Wrap the AST in a `new File`, so `nodePath.buildCodeFrameError` works
  // https://github.com/babel/babel/issues/11889
  const file = new File({ filename: originFileName }, { code: rawContent, ast: root });
  traverse(file.ast, {
    enter(path) {
      if (isTypeNode(path) || isImportDeclaration(path) || path.isDecorator()) {
        // Don't mutate type declarations or import statements
        path.skip();
      } else {
        if (
          options.specificMutants?.length &&
          !options.specificMutants.find(
            (mutant) =>
              mutant.filename == originFileName &&
              path.node.loc!.start.line >= mutant.start.line &&
              path.node.loc!.start.column >= mutant.start.column &&
              path.node.loc!.end.line <= mutant.end.line &&
              path.node.loc!.end.column <= mutant.end.column
          )
        )
          return;
        mutate(path, options).forEach((mutant) => {
          mutantCollector.add(originFileName, mutant);
        });
      }
    },
    exit(path) {
      const mutants = mutantCollector.findUnplacedMutantsInScope(path.node);
      if (placeMutants(path, mutants, originFileName)) {
        path.skip();
        mutantCollector.markMutantsAsPlaced(mutants);
      }
    },
  });
  if (mutantCollector.hasPlacedMutants(originFileName)) {
    root.program.body.unshift(...instrumentationBabelHeader);
  }
};
