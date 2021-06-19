import * as types from '@babel/types';
import { traverse } from '@babel/core';

/* eslint-disable @typescript-eslint/no-duplicate-imports */
// @ts-expect-error The babel types don't define "File" yet
import { File } from '@babel/core';
/* eslint-enable @typescript-eslint/no-duplicate-imports */

import { placeMutants } from '../mutant-placers';
import { mutate } from '../mutators';
import { instrumentationBabelHeader, isTypeNode, isImportDeclaration, locationIncluded, locationOverlaps } from '../util/syntax-helpers';
import { ScriptFormat } from '../syntax';

import { AstTransformer } from '.';

export const transformBabel: AstTransformer<ScriptFormat> = ({ root, originFileName, rawContent, offset }, mutantCollector, { options }) => {
  // Wrap the AST in a `new File`, so `nodePath.buildCodeFrameError` works
  // https://github.com/babel/babel/issues/11889
  const file = new File({ filename: originFileName }, { code: rawContent, ast: root });

  const placementQueue: Array<{ original: types.Node; replacement: types.Node }> = [];

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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        (mutantRangesForCurrentFile.length && mutantRangesForCurrentFile.every((range) => !locationOverlaps(range, path.node.loc!)))
      ) {
        path.skip();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      } else if (!mutantRangesForCurrentFile.length || mutantRangesForCurrentFile.some((range) => locationIncluded(range, path.node.loc!))) {
        mutate(path, options).forEach((mutant) => {
          mutantCollector.add(originFileName, mutant, offset?.position, offset?.line);
        });
      }
    },
    exit(path) {
      const unplacedMutantsInScope = mutantCollector.findUnplacedMutantsInScope(path.node);
      if (unplacedMutantsInScope.length) {
        const placed = placeMutants(path, unplacedMutantsInScope, 'file.js');
        if (placed) {
          placementQueue.unshift({ original: path.node, replacement: placed });
          mutantCollector.markMutantsAsPlaced(unplacedMutantsInScope);
        }
      }

      if (placementQueue.length) {
        const outer = mutantCollector.findUnplacedMutantsInOuterScope(path.node);
        if (!outer.length) {
          // Time for action!
          path.traverse({
            exit(path) {
              const currentPlacementCandidate = placementQueue[placementQueue.length - 1];
              if (path.node === currentPlacementCandidate.original) {
                console.log('Replacing', generator(path.node).code);
                path.replaceWith(currentPlacementCandidate.replacement);
                console.log('Replaced!', generator(path.node).code);
                placementQueue.pop();
                if (!placementQueue.length) {
                  path.stop();
                } else {
                  path.skip();
                }
              }
            },
          });
          if (placementQueue.length === 1) {
            console.log('One lonely placement left');
          }
        } else {
          console.log(`Skip placing of ${placementQueue.length} queue items.`);
        }
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
