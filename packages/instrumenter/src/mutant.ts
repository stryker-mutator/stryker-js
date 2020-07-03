import { types } from '@babel/core';
import generate from '@babel/generator';
import { Mutant as ApiMutant, Location, Position } from '@stryker-mutator/api/core';

export interface NodeMutation {
  replacement: types.Node;
  original: types.Node;
}
export interface NamedNodeMutation extends NodeMutation {
  mutatorName: string;
}

export class Mutant {
  constructor(public id: number, public original: types.Node, public replacement: types.Node, public fileName: string, public mutatorName: string) {}

  public get replacementCode() {
    return generate(this.replacement).code;
  }

  public toApiMutant(): ApiMutant {
    return {
      fileName: this.fileName,
      id: this.id,
      location: toApiLocation(this.original.loc!),
      mutatorName: this.mutatorName,
      range: [this.original.start!, this.original.end!],
      replacement: this.replacementCode,
    };
  }
}

function toApiLocation(source: types.SourceLocation): Location {
  return {
    start: toPosition(source.start),
    end: toPosition(source.end),
  };
}

function toPosition(source: Position): Position {
  return {
    column: source.column,
    line: source.line - 1, // Stryker works 0-based internally
  };
}
