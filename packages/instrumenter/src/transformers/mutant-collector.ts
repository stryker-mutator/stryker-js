import type { types } from '@babel/core';
import { Position } from '@stryker-mutator/api/core';

import { Mutant, Mutable } from '../mutant.js';

export class MutantCollector {
  private readonly _mutants: Mutant[] = [];

  public get mutants(): readonly Mutant[] {
    return this._mutants;
  }

  /**
   * Adds mutants to the internal mutant list.
   * @param fileName file name that houses the mutant
   * @param original The node to mutate
   * @param mutables the named node mutation to be added
   * @param contextPath the context where these mutants are found and should be placed as close by as possible
   * @param offset offset of mutant nodes
   * @returns The mutant (for testability)
   */
  public collect(
    fileName: string,
    original: types.Node,
    mutable: Mutable,
    offset: Position = { line: 0, column: 0 },
  ): Mutant {
    const mutant = new Mutant(
      this._mutants.length.toString(),
      fileName,
      original,
      mutable,
      offset,
    );
    this._mutants.push(mutant);
    return mutant;
  }

  public hasPlacedMutants(fileName: string): boolean {
    return this.mutants.some(
      (mutant) => mutant.fileName === fileName && !mutant.ignoreReason,
    );
  }
}
