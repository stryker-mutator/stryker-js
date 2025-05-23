import babel, { type NodePath, type types } from '@babel/core';

// @ts-expect-error The babel types don't define "File" yet
import { File } from '@babel/core';

import {
  isImportDeclaration,
  isTypeNode,
  locationIncluded,
  locationOverlaps,
  placeHeaderIfNeeded,
} from '../util/syntax-helpers.js';
import { ScriptFormat } from '../syntax/index.js';
import {
  allMutantPlacers,
  MutantPlacer,
  throwPlacementError,
} from '../mutant-placers/index.js';
import { Mutable, Mutant } from '../mutant.js';
import { allMutators } from '../mutators/index.js';

import { DirectiveBookkeeper } from './directive-bookkeeper.js';
import { IgnorerBookkeeper } from './ignorer-bookkeeper.js';

import { AstTransformer } from './index.js';

const { traverse } = babel;

interface MutantsPlacement<TNode extends types.Node> {
  appliedMutants: Map<Mutant, TNode>;
  placer: MutantPlacer<TNode>;
}

type PlacementMap = Map<types.Node, MutantsPlacement<types.Node>>;

export const transformBabel: AstTransformer<ScriptFormat> = (
  { root, originFileName, rawContent, offset },
  mutantCollector,
  { options, mutateDescription, logger },
  mutators = allMutators,
  mutantPlacers = allMutantPlacers,
) => {
  // Wrap the AST in a `new File`, so `nodePath.buildCodeFrameError` works
  // https://github.com/babel/babel/issues/11889
  const file = new File(
    { filename: originFileName },
    { code: rawContent, ast: root },
  );

  // Create a placementMap for the mutation switching bookkeeping
  const placementMap: PlacementMap = new Map();

  // Create the bookkeeper responsible for the // Stryker ... directives
  const directiveBookkeeper = new DirectiveBookkeeper(
    logger,
    mutators,
    originFileName,
  );

  // The ignorer bookkeeper is responsible for keeping track of the ignored node and the reason why it is ignored
  const ignorerBookkeeper = new IgnorerBookkeeper(options.ignorers);

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
      directiveBookkeeper.processStrykerDirectives(path.node);
      if (shouldSkip(path)) {
        path.skip();
      } else {
        ignorerBookkeeper.enterNode(path);
        addToPlacementMapIfPossible(path);
        if (shouldMutate(path)) {
          const mutantsToPlace = collectMutants(path);
          if (mutantsToPlace.length) {
            registerInPlacementMap(path, mutantsToPlace);
          }
        }
      }
    },
    exit(path) {
      placeMutantsIfNeeded(path);
      ignorerBookkeeper.leaveNode(path);
    },
  });

  placeHeaderIfNeeded(mutantCollector, originFileName, options, root);

  /**
   *  If mutants were collected, be sure to register them in the placement map.
   */
  function registerInPlacementMap(path: NodePath, mutantsToPlace: Mutant[]) {
    const placementPath = path.find((ancestor) =>
      placementMap.has(ancestor.node),
    );
    if (placementPath) {
      const { appliedMutants } = placementMap.get(placementPath.node)!;
      mutantsToPlace.forEach((mutant) =>
        appliedMutants.set(mutant, mutant.applied(placementPath.node)),
      );
    } else {
      throw new Error(
        `Mutants cannot be placed. This shouldn't happen! Unplaced mutants: ${JSON.stringify(mutantsToPlace, null, 2)}`,
      );
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
      !mutateDescription ||
      (Array.isArray(mutateDescription) &&
        mutateDescription.every(
          (range) => !locationOverlaps(range, path.node.loc!),
        ))
    );
  }

  function shouldMutate(path: NodePath) {
    return (
      mutateDescription === true ||
      (Array.isArray(mutateDescription) &&
        mutateDescription.some((range) =>
          locationIncluded(range, path.node.loc!),
        ))
    );
  }

  /**
   * Place mutants that are assigned to the current node path (on exit)
   */
  function placeMutantsIfNeeded(path: NodePath) {
    const mutantsPlacement = placementMap.get(path.node);
    if (mutantsPlacement?.appliedMutants.size) {
      try {
        mutantsPlacement.placer.place(path, mutantsPlacement.appliedMutants);
        path.skip();
      } catch (error) {
        throwPlacementError(
          error as Error,
          path,
          mutantsPlacement.placer,
          [...mutantsPlacement.appliedMutants.keys()],
          originFileName,
        );
      }
    }
  }

  /**
   * Collect the mutants for the current node and return the non-ignored.
   */
  function collectMutants(path: NodePath) {
    return [...mutate(path)]
      .map((mutable) =>
        mutantCollector.collect(originFileName, path.node, mutable, offset),
      )
      .filter((mutant) => !mutant.ignoreReason);
  }

  /**
   * Generate mutants for the current node.
   */
  function* mutate(node: NodePath): Iterable<Mutable> {
    for (const mutator of mutators) {
      for (const replacement of mutator.mutate(node)) {
        yield {
          replacement,
          mutatorName: mutator.name,
          ignoreReason:
            directiveBookkeeper.findIgnoreReason(
              node.node.loc!.start.line,
              mutator.name,
            ) ??
            findExcludedMutatorIgnoreReason(mutator.name) ??
            ignorerBookkeeper.currentIgnoreMessage,
        };
      }
    }

    function findExcludedMutatorIgnoreReason(
      mutatorName: string,
    ): string | undefined {
      if (options.excludedMutations.includes(mutatorName)) {
        return `Ignored because of excluded mutation "${mutatorName}"`;
      } else {
        return undefined;
      }
    }
  }
};
