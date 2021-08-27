import { types } from '@babel/core';
import { notEmpty } from '@stryker-mutator/util';

const ALL = 'all';
const DEFAULT_REASON = 'Ignored using a comment';

/**
 * Responsible for the bookkeeping of "// Stryker" directives like "disable" and "restore".
 */
export class DirectiveBookkeeper {
  // https://regex101.com/r/nWLLLm/1
  private readonly strykerCommentDirectiveRegex = /^\s?Stryker (disable|restore)(?: (next-line))? ([a-zA-Z, ]+)(?::(.+)?)?/;

  private readonly linesDisabled: Map<number, Map<string, string>> = new Map();
  private readonly linesRestored: Map<number, Set<string>> = new Map();
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
                const currentLineMap = this.findDisabledLineMap(loc!);
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
            switch (scope) {
              case 'next-line':
                const disabledMap = this.findDisabledLineMap(loc!);
                const restoredSet = this.findRestoredLineSet(loc!);
                mutatorNames.forEach((mutatorName) => {
                  disabledMap.delete(mutatorName);
                  restoredSet.add(mutatorName);
                });

                break;
              default:
                mutatorNames.forEach((mutatorName) => {
                  this.currentlyRestored.add(mutatorName);
                  this.currentlyDisabled.delete(mutatorName);
                });
                break;
            }
            break;
        }
      });
  }

  private findDisabledLineMap({ start: { line } }: types.SourceLocation) {
    let currentLineMap = this.linesDisabled.get(line);
    if (!currentLineMap) {
      currentLineMap = new Map();
      this.linesDisabled.set(line, currentLineMap);
    }
    return currentLineMap;
  }

  private findRestoredLineSet({ start: { line } }: types.SourceLocation) {
    let currentLineSet = this.linesRestored.get(line);
    if (!currentLineSet) {
      currentLineSet = new Set();
      this.linesRestored.set(line, currentLineSet);
    }
    return currentLineSet;
  }

  public findIgnoreReason(line: number, mutatorName: string): string | undefined {
    mutatorName = mutatorName.toLowerCase();

    // If this mutator was restored on this line, use that (precedence)
    if (this.mutatorIsRestored(this.linesRestored.get(line), mutatorName)) {
      return;
    }

    // Else if mutator was disabled on this line, use that
    const mutatorsDisabledForThisLine = this.linesDisabled.get(line);
    if (mutatorsDisabledForThisLine) {
      const ignoreReason = this.ignoreReasonFromDisabled(mutatorsDisabledForThisLine, mutatorName);
      if (ignoreReason) {
        return ignoreReason;
      }
    }

    // Else if mutator was was restored globally
    if (!this.mutatorIsRestored(this.currentlyRestored, mutatorName)) {
      // Else if mutator was ignored globally
      return this.ignoreReasonFromDisabled(this.currentlyDisabled, mutatorName);
    }
    return;
  }

  private ignoreReasonFromDisabled(mutatorsDisabled: Map<string, string>, mutatorName: string) {
    return mutatorsDisabled.get(mutatorName) ?? mutatorsDisabled.get(ALL);
  }

  private mutatorIsRestored(restoredMutatorsSet: Set<string> | undefined, mutatorName: string): boolean {
    return notEmpty(restoredMutatorsSet) && (restoredMutatorsSet.has(mutatorName) || restoredMutatorsSet.has(ALL));
  }
}
