import { Location, Range } from 'stryker-api/core';

export class MutantCandidate {
  constructor(public mutatorName: string, public filename: string, public originalCode: string, public replacement: string, public location: Location, public range: Range) {
  }
}