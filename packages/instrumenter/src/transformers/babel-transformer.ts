import { traverse } from '@babel/core';

/* eslint-disable @typescript-eslint/no-duplicate-imports */
// @ts-expect-error The babel types don't define "File" yet
import { File } from '@babel/core';
/* eslint-enable @typescript-eslint/no-duplicate-imports */

import { placeMutants } from '../mutant-placers';
import { mutate } from '../mutators';
import { instrumentationBabelHeader, isTypeNode, isImportDeclaration, locationIncluded, locationOverlaps } from '../util/syntax-helpers';
import { AstFormat } from '../syntax';

import { AstTransformer } from '.';

export const transformBabel: AstTransformer<AstFormat.JS | AstFormat.TS> = (
  { root, originFileName, rawContent, offset },
  mutantCollector,
  { options }
) => {
  // Wrap the AST in a `new File`, so `nodePath.buildCodeFrameError` works
  // https://github.com/babel/babel/issues/11889
  const file = new File({ filename: originFileName }, { code: rawContent, ast: root });

  // Range filters that are in scope for the current file
  const mutantRangesForCurrentFile = options.mutationRanges.filter((mutantRange) => mutantRange.fileName === originFileName);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  traverse(file.ast, {
    enter(path) {
      // Don't mutate import statements, type definitions and nodes that don't have overlap with the current range filter
      if (
        isTypeNode(path) ||
        isImportDeclaration(path) ||
        path.isDecorator() ||
        (mutantRangesForCurrentFile.length && mutantRangesForCurrentFile.every((range) => !locationOverlaps(range, path.node.loc!)))
      ) {
        path.skip();
      } else if (!mutantRangesForCurrentFile.length || mutantRangesForCurrentFile.some((range) => locationIncluded(range, path.node.loc!))) {
        mutate(path, options).forEach((mutant) => {
          mutantCollector.add(originFileName, mutant, offset?.position, offset?.line);
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
    // Be sure to leave comments like `// @flow` in.
    let header = instrumentationBabelHeader;
    if (Array.isArray(root.program.body[0]?.leadingComments)) {
      header = [
        {
          ...instrumentationBabelHeader[0],
          leadingComments: root.program.body[0]?.leadingComments,
        },
        ...instrumentationBabelHeader.slice(1),
      ];
    }
    root.program.body.unshift(...header);
  }
};
