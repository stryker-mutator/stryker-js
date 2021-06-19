import { traverse, types } from '@babel/core';
import generate from '@babel/generator';
import { Mutant as ApiMutant, Location, Position, MutantStatus } from '@stryker-mutator/api/core';

import { eqNode } from './util';

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

  constructor(
    public readonly id: string,
    public readonly fileName: string,
    specs: NamedNodeMutation,
    public readonly positionOffset: number = 0,
    public readonly lineOffset: number = 0
  ) {
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
      location: toApiLocation(this.original.loc!, this.lineOffset),
      mutatorName: this.mutatorName,
      replacement: this.replacementCode,
      statusReason: this.ignoreReason,
      status: this.ignoreReason ? MutantStatus.Ignored : undefined,
    };
  }

  /**
   * Applies the mutant in (a copy of) the AST, without changing provided AST.
   * Can the the tree itself (in which case the replacement is returned),
   * or can be nested in the given tree.
   * @param originalTree The original node, which will be treated as readonly
   */
  public applied<TNode extends types.Node>(originalTree: TNode): TNode {
    if (eqNode(originalTree, this.original)) {
      return this.replacement as TNode;
    } else {
      const mutatedAst = types.cloneNode(originalTree, /*deep*/ true, /* withLocations */ false);
      let applied = false;
      const { original, replacement } = this;
      traverse(mutatedAst, {
        noScope: true,
        enter(path) {
          if (eqNode(path.node, original)) {
            path.replaceWith(replacement);
            path.stop();
            applied = true;
          }
        },
      });
      if (!applied) {
        throw new Error(`Could not apply mutant ${JSON.stringify(this.replacement)}.`);
      }
      return mutatedAst;
    }
  }
}

function toApiLocation(source: types.SourceLocation, lineOffset: number): Location {
  return {
    start: toPosition(source.start, lineOffset),
    end: toPosition(source.end, lineOffset),
  };
}

function toPosition(source: Position, lineOffset: number): Position {
  return {
    column: source.column,
    line: source.line + lineOffset - 1, // Stryker works 0-based internally
  };
}
