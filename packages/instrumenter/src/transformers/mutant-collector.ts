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
   * @param param1 the named node mutation to be added
   * @returns The mutant (for testability)
   */
  public add(fileName: string, { mutatorName, original, replacement }: NamedNodeMutation): Mutant {
    replacement.end = original.end;
    replacement.start = original.start;
    replacement.loc = original.loc;
    const mutant = new Mutant(this._mutants.length, original, replacement, fileName, mutatorName);
    this._mutants.push(mutant);
    this.unplacedMutants.push(mutant);
    return mutant;
  }

  public findUnplacedMutantsInScope(scope: Pick<types.Node, 'start' | 'end'>): Mutant[] {
    return this.unplacedMutants.filter((mutant) => scope.start! <= mutant.replacement.start! && scope.end! >= mutant.replacement.end!);
  }

  public markMutantsAsPlaced(mutants: Mutant[]): void {
    this.unplacedMutants = this.unplacedMutants.filter((unplaced) => !mutants.includes(unplaced));
  }
}
