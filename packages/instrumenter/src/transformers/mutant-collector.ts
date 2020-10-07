import { types } from '@babel/core';

import { Mutant, NamedNodeMutation } from '../mutant';

export class MutantCollector {
  private readonly _mutants: Mutant[] = [];
  private unplacedMutants: Mutant[] = [];

  public get mutants(): readonly Mutant[] {
    return this._mutants;
  }

  /**
   * Adds a mutant to the internal mutant list.
   * @param fileName file name that houses the mutant
   * @param mutationSpecs the named node mutation to be added
   * @returns The mutant (for testability)
   */
  public add(fileName: string, mutationSpecs: NamedNodeMutation): Mutant {
    mutationSpecs.replacement.end = mutationSpecs.original.end;
    mutationSpecs.replacement.start = mutationSpecs.original.start;
    mutationSpecs.replacement.loc = mutationSpecs.original.loc;
    const mutant = new Mutant(this._mutants.length, fileName, mutationSpecs);
    this._mutants.push(mutant);
    if (mutant.ignoreReason === undefined) {
      // Only place mutants that are not ignored
      this.unplacedMutants.push(mutant);
    }
    return mutant;
  }

  public findUnplacedMutantsInScope(scope: Pick<types.Node, 'start' | 'end'>): Mutant[] {
    return this.unplacedMutants.filter((mutant) => scope.start! <= mutant.replacement.start! && scope.end! >= mutant.replacement.end!);
  }

  public markMutantsAsPlaced(mutants: Mutant[]): void {
    this.unplacedMutants = this.unplacedMutants.filter((unplaced) => !mutants.includes(unplaced));
  }

  public hasPlacedMutants(fileName: string) {
    const unplacedMutants = this.unplacedMutants.filter((mutant) => mutant.fileName === fileName);
    return this.mutants.some((mutant) => !unplacedMutants.includes(mutant) && mutant.fileName === fileName);
  }
}
