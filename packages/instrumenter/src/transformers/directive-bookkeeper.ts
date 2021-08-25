import { types } from '@babel/core';
import { notEmpty } from '@stryker-mutator/util';

const ALL = 'all';
const DEFAULT_REASON = 'Ignored by user comment';

/**
 * Responsible for the bookkeeping of "// Stryker" directives like "disable", "restore" and "disable-next-line".
 */
export class DirectiveBookkeeper {
  // https://regex101.com/r/i7DCgc/1
  private readonly strykerCommentDirectiveRegex = /^\s?Stryker (disable|restore|disable-next-line)(?:\s(?:\[([a-zA-Z, ]+)\]))?(:? (.+)?)?$/;

  private readonly linesDisabled: Map<number, Map<string, string>> = new Map();
  private readonly currentlyDisabled: Map<string, string> = new Map();
  private readonly currentlyRestored: Set<string> = new Set();

  public processStrykerDirectives({ loc, leadingComments }: types.Node): void {
    leadingComments
      ?.map((comment) => this.strykerCommentDirectiveRegex.exec(comment.value) as [string, string, string | undefined, string | undefined] | null)
      .filter(notEmpty)
      .forEach(([, directiveType, mutatorNames, reason]) => {
        const normalizedMutatorNames = mutatorNames?.split(',').map((mutator) => mutator.trim().toLowerCase()) ?? [ALL];
        const normalizedReason = (reason ?? DEFAULT_REASON).trim();
        switch (directiveType) {
          case 'disable':
            normalizedMutatorNames.forEach((mutatorName) => {
              this.currentlyDisabled.set(mutatorName, normalizedReason);
              this.currentlyRestored.delete(mutatorName);
            });
            break;
          case 'restore':
            normalizedMutatorNames.forEach((mutatorName) => {
              this.currentlyRestored.add(mutatorName);
              this.currentlyDisabled.delete(mutatorName);
            });
            break;
          case 'disable-next-line':
            let currentLineMap = this.linesDisabled.get(loc!.start.line);
            if (!currentLineMap) {
              currentLineMap = new Map();
              this.linesDisabled.set(loc!.start.line, currentLineMap);
            }
            normalizedMutatorNames.forEach((mutatorName) => currentLineMap!.set(mutatorName, normalizedReason));
            break;
        }
      });
  }

  public findIgnoreReason(line: number, mutatorName: string): string | undefined {
    const mutatorsDisabledForThisLine = this.linesDisabled.get(line);
    if (mutatorsDisabledForThisLine) {
      const ignoreReason = mutatorsDisabledForThisLine.get(mutatorName) ?? mutatorsDisabledForThisLine.get(ALL);
      if (ignoreReason) {
        return ignoreReason;
      }
    }

    const ignoreReason = this.currentlyDisabled.get(mutatorName) ?? this.currentlyDisabled.get(ALL);
    if (ignoreReason) {
      if (!this.currentlyRestored.has(mutatorName) && !this.currentlyRestored.has(ALL)) {
        return ignoreReason;
      }
    }
    return undefined;
  }
}
