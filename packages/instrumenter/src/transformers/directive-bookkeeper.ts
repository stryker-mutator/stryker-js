import { types } from '@babel/core';
import { notEmpty } from '@stryker-mutator/util';

const ALL = 'all';
const DEFAULT_REASON = 'Ignored using a comment';

/**
 * Responsible for the bookkeeping of "// Stryker" directives like "disable", "restore" and "disable-next-line".
 */
export class DirectiveBookkeeper {
  // https://regex101.com/r/nWLLLm/1
  private readonly strykerCommentDirectiveRegex = /^\s?Stryker (disable|restore)(?: (next-line))? ([a-zA-Z, ]+)(?::(.+)?)?/;

  private readonly linesDisabled: Map<number, Map<string, string>> = new Map();
  private readonly currentlyDisabled: Map<string, string> = new Map();
  private readonly currentlyRestored: Set<string> = new Set();

  public processStrykerDirectives({ loc, leadingComments }: types.Node): void {
    leadingComments
      ?.map(
        (comment) =>
          this.strykerCommentDirectiveRegex.exec(comment.value) as
            | [fullMatch: string, directiveType: string, scope: string | undefined, mutators: string, reason: string | undefined]
            | null
      )
      .filter(notEmpty)
      .forEach(([, directiveType, scope, mutators, optionalReason]) => {
        const mutatorNames = mutators.split(',').map((mutator) => mutator.trim().toLowerCase());
        const reason = (optionalReason ?? DEFAULT_REASON).trim();
        switch (directiveType) {
          case 'disable':
            switch (scope) {
              case 'next-line':
                const currentLineMap = this.findDisabledLineMap(loc);
                mutatorNames.forEach((mutatorName) => currentLineMap.set(mutatorName, reason));
                break;
              default:
                mutatorNames.forEach((mutatorName) => {
                  this.currentlyDisabled.set(mutatorName, reason);
                  this.currentlyRestored.delete(mutatorName);
                });
                break;
            }
            break;
          case 'restore':
            mutatorNames.forEach((mutatorName) => {
              this.currentlyRestored.add(mutatorName);
              this.currentlyDisabled.delete(mutatorName);
            });
            break;
        }
      });
  }

  private findDisabledLineMap(loc: types.SourceLocation | null) {
    let currentLineMap = this.linesDisabled.get(loc!.start.line);
    if (!currentLineMap) {
      currentLineMap = new Map();
      this.linesDisabled.set(loc!.start.line, currentLineMap);
    }
    return currentLineMap;
  }

  public findIgnoreReason(line: number, mutatorName: string): string | undefined {
    mutatorName = mutatorName.toLowerCase();
    const mutatorsDisabledForThisLine = this.linesDisabled.get(line);
    if (mutatorsDisabledForThisLine) {
      const ignoreReason = mutatorsDisabledForThisLine.get(mutatorName) ?? mutatorsDisabledForThisLine.get(ALL);
      if (ignoreReason) {
        return ignoreReason;
      }
    }

    if (!this.currentlyRestored.has(mutatorName) && !this.currentlyRestored.has(ALL)) {
      return this.currentlyDisabled.get(mutatorName) ?? this.currentlyDisabled.get(ALL);
    }
    return;
  }
}
