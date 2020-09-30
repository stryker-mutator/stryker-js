import { types } from '@babel/core';
import generate from '@babel/generator';
import { Mutant as ApiMutant, Location, Position } from '@stryker-mutator/api/core';

export interface NodeMutation {
  replacement: types.Node;
  original: types.Node;
}
export interface NamedNodeMutation extends NodeMutation {
  mutatorName: string;
  ignoreReason?: string;
}

export class Mutant {
  public readonly replacementCode: string;
  public readonly original: types.Node;
  public readonly replacement: types.Node;
  public readonly mutatorName: string;
  public readonly ignoreReason: string | undefined;

  constructor(public readonly id: number, public readonly fileName: string, specs: NamedNodeMutation) {
    this.original = specs.original;
    this.replacement = specs.replacement;
    this.mutatorName = specs.mutatorName;
    this.ignoreReason = specs.ignoreReason;
    this.replacementCode = generate(this.replacement).code;
  }

  public toApiMutant(): ApiMutant {
    return {
      fileName: this.fileName,
      id: this.id,
      location: toApiLocation(this.original.loc!),
      mutatorName: this.mutatorName,
      range: [this.original.start!, this.original.end!],
      replacement: this.replacementCode,
      ignoreReason: this.ignoreReason,
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
