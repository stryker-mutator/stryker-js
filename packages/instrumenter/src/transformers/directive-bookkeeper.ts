import type { types } from '@babel/core';
import { notEmpty } from '@stryker-mutator/util';

const WILDCARD = 'all';
const DEFAULT_REASON = 'Ignored using a comment';

type IgnoreReason = string | undefined;

interface Rule {
  findIgnoreReason(mutatorName: string, line: number): IgnoreReason;
}

class IgnoreRule implements Rule {
  constructor(public mutatorNames: string[], public line: number | undefined, public ignoreReason: IgnoreReason, public previousRule: Rule) {}

  private matches(mutatorName: string, line: number): boolean {
    const lineMatches = () => this.line === undefined || this.line === line;
    const mutatorMatches = () => this.mutatorNames.includes(mutatorName) || this.mutatorNames.includes(WILDCARD);
    return lineMatches() && mutatorMatches();
  }

  public findIgnoreReason(mutatorName: string, line: number): IgnoreReason {
    if (this.matches(mutatorName, line)) {
      return this.ignoreReason;
    }
    return this.previousRule.findIgnoreReason(mutatorName, line);
  }
}

class RestoreRule extends IgnoreRule {
  constructor(mutatorNames: string[], line: number | undefined, previousRule: Rule) {
    super(mutatorNames, line, undefined, previousRule);
  }
}

const rootRule: Rule = {
  findIgnoreReason() {
    return undefined;
  },
};

/**
 * Responsible for the bookkeeping of "// Stryker" directives like "disable" and "restore".
 */
export class DirectiveBookkeeper {
  // https://regex101.com/r/nWLLLm/1
  private readonly strykerCommentDirectiveRegex = /^\s?Stryker (disable|restore)(?: (next-line))? ([a-zA-Z, ]+)(?::(.+)?)?/;

  private currentIgnoreRule = rootRule;

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
                this.currentIgnoreRule = new IgnoreRule(mutatorNames, loc!.start.line, reason, this.currentIgnoreRule);
                break;
              default:
                this.currentIgnoreRule = new IgnoreRule(mutatorNames, undefined, reason, this.currentIgnoreRule);
                break;
            }
            break;
          case 'restore':
            switch (scope) {
              case 'next-line':
                this.currentIgnoreRule = new RestoreRule(mutatorNames, loc!.start.line, this.currentIgnoreRule);
                break;
              default:
                this.currentIgnoreRule = new RestoreRule(mutatorNames, undefined, this.currentIgnoreRule);
                break;
            }
            break;
        }
      });
  }

  public findIgnoreReason(line: number, mutatorName: string): string | undefined {
    mutatorName = mutatorName.toLowerCase();
    return this.currentIgnoreRule.findIgnoreReason(mutatorName, line);
  }
}
