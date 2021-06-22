import { NodePath, types } from '@babel/core';

import { Mutant, Mutable } from '../mutant';
import { MutantPlacer, mutantPlacers } from '../mutant-placers';
import { Offset } from '../syntax';

export interface MutantsPlacement<TNode extends types.Node> {
  appliedMutants: Map<Mutant, TNode>;
  placer: MutantPlacer<TNode>;
}

export class MutantCollector {
  constructor(private readonly placers: Array<MutantPlacer<types.Node>> = mutantPlacers) {}

  private readonly _mutants: Mutant[] = [];
  private readonly placements: Map<types.Node, MutantsPlacement<types.Node>> = new Map();

  public get mutants(): readonly Mutant[] {
    return this._mutants;
  }

  /**
   * Adds mutants to the internal mutant list.
   * @param fileName file name that houses the mutant
   * @param mutables the named node mutation to be added
   * @param contextPath the context where these mutants are found and should be placed as close by as possible
   * @param offset offset of mutant nodes
   * @returns The mutant (for testability)
   */
  public add(fileName: string, mutables: Mutable[], contextPath: NodePath, offset: Offset = { line: 0, position: 0 }): Mutant[] {
    const mutants = mutables.map((mutable, index) => new Mutant((this._mutants.length + index).toString(), fileName, mutable, offset));
    this._mutants.push(...mutants);
    const unplacedMutants = mutants.filter((mutant) => !mutant.ignoreReason);
    if (unplacedMutants.length) {
      let placer: MutantPlacer<types.Node> | undefined = undefined;
      const placementPath = contextPath.find((ancestor) => {
        placer = this.placers.find((p) => p.canPlace(ancestor));
        return Boolean(placer);
      });
      if (placementPath && placer) {
        const placement = this.getOrCreatePlacement(placementPath.node, placer);
        unplacedMutants.forEach((mutant) => placement.appliedMutants.set(mutant, mutant.applied(placementPath.node)));
      } else {
        throw new Error(`Mutants cannot be placed. This shouldn't happen! Unplaced mutants: ${JSON.stringify(unplacedMutants, null, 2)}`);
      }
    }
    return mutants;
  }

  private getOrCreatePlacement<TNode extends types.Node>(node: TNode, placer: MutantPlacer<TNode>) {
    const placement = this.placements.get(node);
    if (placement) {
      return placement;
    } else {
      const newPlacement: MutantsPlacement<TNode> = {
        appliedMutants: new Map(),
        placer,
      };
      this.placements.set(node, newPlacement);
      return newPlacement;
    }
  }

  public findPlacementsHere<TNode extends types.Node>(scope: TNode): MutantsPlacement<TNode> | undefined {
    return this.placements.get(scope) as MutantsPlacement<TNode> | undefined;
  }

  public hasPlacedMutants(fileName: string): boolean {
    return this.mutants.some((mutant) => mutant.fileName === fileName && !mutant.ignoreReason);
  }
}
