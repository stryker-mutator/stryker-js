import { NodePath, traverse, types } from '@babel/core';

/* eslint-disable @typescript-eslint/no-duplicate-imports */
// @ts-expect-error The babel types don't define "File" yet
import { File } from '@babel/core';
/* eslint-enable @typescript-eslint/no-duplicate-imports */

import { allMutators } from '../mutators';
import { instrumentationBabelHeader, isImportDeclaration, isTypeNode, locationIncluded, locationOverlaps } from '../util/syntax-helpers';
import { ScriptFormat } from '../syntax';
import { allMutantPlacers, MutantPlacer, throwPlacementError } from '../mutant-placers';
import { Mutable, Mutant } from '../mutant';

import { AstTransformer } from '.';

interface MutantsPlacement<TNode extends types.Node> {
  appliedMutants: Map<Mutant, TNode>;
  placer: MutantPlacer<TNode>;
}

type PlacementMap = Map<types.Node, MutantsPlacement<types.Node>>;

const DISABLE_ALL_MUTANTS = 'ALL';

type DisabledMutantMap = Map<number, string[] | typeof DISABLE_ALL_MUTANTS>;

export const transformBabel: AstTransformer<ScriptFormat> = (
  { root, originFileName, rawContent, offset },
  mutantCollector,
  { options },
  mutators = allMutators,
  mutantPlacers = allMutantPlacers
) => {
  // Wrap the AST in a `new File`, so `nodePath.buildCodeFrameError` works
  // https://github.com/babel/babel/issues/11889
  const file = new File({ filename: originFileName }, { code: rawContent, ast: root });

  // Range filters that are in scope for the current file
  const mutantRangesForCurrentFile = options.mutationRanges.filter((mutantRange) => mutantRange.fileName === originFileName);

  // Create a placementMap for the mutation switching bookkeeping
  const placementMap: PlacementMap = new Map();

  const disabledMutationMap: DisabledMutantMap = new Map();

  // Now start the actual traversing of the AST
  //
  // On the way down:
  // * Treat the tree as immutable.
  // * Identify the nodes that can be used to place mutants on in the placement map.
  // * Generate the mutants on each node.
  //    * When a node generated mutants, do a short walk back up and register them in the placement map
  //    * Call the `applied` method using the placement node, that way the mutant will capture the AST with mutation all the way to the placement node
  //
  // On the way up:
  // * If this node has mutants in the placementMap, place them in the AST.
  //
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  traverse(file.ast, {
    enter(path) {
      addCommentsToMutantDisableMap(path.node.loc, path.node.leadingComments);

      if (shouldSkip(path)) {
        path.skip();
      } else {
        addToPlacementMapIfPossible(path);
        if (!mutantRangesForCurrentFile.length || mutantRangesForCurrentFile.some((range) => locationIncluded(range, path.node.loc!))) {
          const mutantsToPlace = collectMutants(path);
          if (mutantsToPlace.length) {
            registerInPlacementMap(path, mutantsToPlace);
          }
        }
      }
    },
    exit(path) {
      placeMutantsIfNeeded(path);
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

  /**
   * Takes the leading comments of a location and adds if they're a mutation disable comment then adds them
   * to the mutantDisableMap
   */
  function addCommentsToMutantDisableMap(location: types.SourceLocation | null, comments: readonly types.Comment[] | null): void {
    if (!comments || !location) {
      return;
    }

    comments
      .filter((comment) => comment.value.trim().startsWith('Stryker disable-next-line'))
      .forEach((comment) => {
        const [_, _disableType, mutations] = comment.value.trim().split(' ');
        const disabledMutants: string[] | typeof DISABLE_ALL_MUTANTS = (mutations as string | undefined)?.split(',') ?? DISABLE_ALL_MUTANTS;

        const disabledMutationsForLine = disabledMutationMap.get(location.start.line);
        if (disabledMutationsForLine === undefined) {
          disabledMutationMap.set(location.start.line, disabledMutants);
          return;
        }

        if (disabledMutationsForLine === DISABLE_ALL_MUTANTS) {
          return;
        }

        if (disabledMutants === DISABLE_ALL_MUTANTS) {
          disabledMutationMap.set(location.start.line, disabledMutants);
          return;
        }

        disabledMutationMap.set(location.start.line, [...disabledMutationsForLine, ...disabledMutants]);
      });
  }

  /**
   *  If mutants were collected, be sure to register them in the placement map.
   */
  function registerInPlacementMap(path: NodePath, mutantsToPlace: Mutant[]) {
    const placementPath = path.find((ancestor) => placementMap.has(ancestor.node));
    if (placementPath) {
      const appliedMutants = placementMap.get(placementPath.node)!.appliedMutants;
      mutantsToPlace.forEach((mutant) => appliedMutants.set(mutant, mutant.applied(placementPath.node)));
    } else {
      throw new Error(`Mutants cannot be placed. This shouldn't happen! Unplaced mutants: ${JSON.stringify(mutantsToPlace, null, 2)}`);
    }
  }

  /**
   * If this node can be used to place mutants on, add to the placement map
   */
  function addToPlacementMapIfPossible(path: NodePath) {
    const placer = mutantPlacers.find((p) => p.canPlace(path));
    if (placer) {
      placementMap.set(path.node, { appliedMutants: new Map(), placer });
    }
  }

  /**
   * Don't traverse import declarations, decorators and nodes that don't have overlap with the selected mutation ranges
   */
  function shouldSkip(path: NodePath) {
    return (
      isTypeNode(path) ||
      isImportDeclaration(path) ||
      path.isDecorator() ||
      (mutantRangesForCurrentFile.length && mutantRangesForCurrentFile.every((range) => !locationOverlaps(range, path.node.loc!)))
    );
  }

  function isMutantInDisabledMap(location: types.SourceLocation | null, mutant: Mutable): boolean {
    const line = location?.start.line;
    if (!line) return false;

    const disabledMutantsForLine = disabledMutationMap.get(line);
    if (!disabledMutantsForLine) {
      return false;
    }

    return disabledMutantsForLine === DISABLE_ALL_MUTANTS || disabledMutantsForLine.includes(mutant.mutatorName);
  }

  /**
   * Place mutants that are assigned to the current node path (on exit)
   */
  function placeMutantsIfNeeded(path: NodePath<types.Node>) {
    const mutantsPlacement = placementMap.get(path.node);
    if (mutantsPlacement?.appliedMutants.size) {
      try {
        mutantsPlacement.placer.place(path, mutantsPlacement.appliedMutants);
        path.skip();
      } catch (error) {
        throwPlacementError(error as Error, path, mutantsPlacement.placer, [...mutantsPlacement.appliedMutants.keys()], originFileName);
      }
    }
  }

  /**
   * Collect the mutants for the current node and return the non-ignored.
   */
  function collectMutants(path: NodePath) {
    return [...mutate(path)]
      .filter((mutant) => !isMutantInDisabledMap(path.node.loc, mutant))
      .map((mutable) => mutantCollector.collect(originFileName, path.node, mutable, offset))
      .filter((mutant) => !mutant.ignoreReason);
  }

  /**
   * Generate mutants for the current node.
   */
  function* mutate(node: NodePath): Iterable<Mutable> {
    for (const mutator of mutators) {
      for (const replacement of mutator.mutate(node)) {
        yield { replacement, mutatorName: mutator.name, ignoreReason: formatIgnoreReason(mutator.name) };
      }
    }

    function formatIgnoreReason(mutatorName: string): string | undefined {
      if (options.excludedMutations.includes(mutatorName)) {
        return `Ignored because of excluded mutation "${mutatorName}"`;
      } else {
        return undefined;
      }
    }
  }
};
