import babel, { type types } from '@babel/core';
import generate from '@babel/generator';
import {
  Mutant as ApiMutant,
  Location,
  Position,
} from '@stryker-mutator/api/core';

import { deepCloneNode, eqNode } from './util/index.js';

const { traverse } = babel;

const generator = generate.default;

export interface Mutable {
  mutatorName: string;
  ignoreReason?: string;
  replacement: types.Node;
}

export class Mutant implements Mutable {
  public readonly replacementCode: string;
  public readonly replacement: types.Node;
  public readonly mutatorName: string;
  public readonly ignoreReason: string | undefined;

  constructor(
    public readonly id: string,
    public readonly fileName: string,
    public readonly original: types.Node,
    specs: Mutable,
    public readonly offset: Position = { column: 0, line: 0 },
  ) {
    this.replacement = specs.replacement;
    this.mutatorName = specs.mutatorName;
    this.ignoreReason = specs.ignoreReason;
    this.replacementCode = generator(this.replacement).code;
  }

  public toApiMutant(): ApiMutant {
    return {
      fileName: this.fileName,
      id: this.id,
      location: toApiLocation(this.original.loc!, this.offset),
      mutatorName: this.mutatorName,
      replacement: this.replacementCode,
      statusReason: this.ignoreReason,
      status: this.ignoreReason ? 'Ignored' : undefined,
    };
  }

  /**
   * Applies the mutant in (a copy of) the AST, without changing provided AST.
   * Can the tree itself (in which case the replacement is returned),
   * or can be nested in the given tree.
   * @param originalTree The original node, which will be treated as readonly
   */
  public applied<TNode extends types.Node>(originalTree: TNode): TNode {
    if (originalTree === this.original) {
      return this.replacement as TNode;
    } else {
      const mutatedAst = deepCloneNode(originalTree);
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
        throw new Error(
          `Could not apply mutant ${JSON.stringify(this.replacement)}.`,
        );
      }
      return mutatedAst;
    }
  }
}

function toApiLocation(
  source: types.SourceLocation,
  offset: Position,
): Location {
  const loc = {
    start: toPosition(source.start, offset),
    end: toPosition(source.end, offset),
  };
  return loc;
}

function toPosition(source: Position, offset: Position): Position {
  return {
    column: source.column + (source.line === 1 ? offset.column : 0), // offset is zero-based
    line: source.line + offset.line - 1, // Stryker works 0-based internally, offset is zero based as well
  };
}
