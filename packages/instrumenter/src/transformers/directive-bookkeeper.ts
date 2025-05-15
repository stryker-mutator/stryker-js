import type { types } from '@babel/core';
import { notEmpty } from '@stryker-mutator/util';

import { Logger } from '@stryker-mutator/api/logging';

import { NodeMutator } from '../mutators/node-mutator.js';

const WILDCARD = 'all';
const DEFAULT_REASON = 'Ignored using a comment';

type IgnoreReason = string | undefined;

interface Rule {
  findIgnoreReason(mutatorName: string, line: number): IgnoreReason;
}

class IgnoreRule implements Rule {
  constructor(
    public mutatorNames: string[],
    public line: number | undefined,
    public ignoreReason: IgnoreReason,
    public previousRule: Rule,
  ) {}

  private matches(mutatorName: string, line: number): boolean {
    const lineMatches = () => this.line === undefined || this.line === line;
    const mutatorMatches = () =>
      this.mutatorNames.includes(mutatorName) ||
      this.mutatorNames.includes(WILDCARD);
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
  constructor(
    mutatorNames: string[],
    line: number | undefined,
    previousRule: Rule,
  ) {
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
  private readonly strykerCommentDirectiveRegex =
    /^\s?Stryker (disable|restore)(?: (next-line))? ([a-zA-Z, ]+)(?::(.+)?)?/;

  private currentIgnoreRule = rootRule;
  private readonly allMutatorNames: string[];

  constructor(
    private readonly logger: Logger,
    private readonly allMutators: NodeMutator[],
    private readonly originFileName: string,
  ) {
    this.allMutatorNames = this.allMutators.map((x) => x.name.toLowerCase());
  }

  public processStrykerDirectives({ loc, leadingComments }: types.Node): void {
    leadingComments
      ?.map((comment) => ({
        comment,
        matchResult: this.strykerCommentDirectiveRegex.exec(comment.value) as
          | [
              fullMatch: string,
              directiveType: string,
              scope: string | undefined,
              mutators: string,
              reason: string | undefined,
            ]
          | null,
      }))
      .filter(({ matchResult }) => notEmpty(matchResult))
      .forEach(({ comment, matchResult }) => {
        const [, directiveType, scope, mutators, optionalReason] = matchResult!;
        let mutatorNames = mutators.split(',').map((mutator) => mutator.trim());
        this.warnAboutUnusedDirective(
          mutatorNames,
          directiveType,
          scope,
          comment,
        );
        mutatorNames = mutatorNames.map((mutator) => mutator.toLowerCase());
        const reason = (optionalReason ?? DEFAULT_REASON).trim();
        switch (directiveType) {
          case 'disable':
            switch (scope) {
              case 'next-line':
                this.currentIgnoreRule = new IgnoreRule(
                  mutatorNames,
                  loc!.start.line,
                  reason,
                  this.currentIgnoreRule,
                );
                break;
              default:
                this.currentIgnoreRule = new IgnoreRule(
                  mutatorNames,
                  undefined,
                  reason,
                  this.currentIgnoreRule,
                );
                break;
            }
            break;
          case 'restore':
            switch (scope) {
              case 'next-line':
                this.currentIgnoreRule = new RestoreRule(
                  mutatorNames,
                  loc!.start.line,
                  this.currentIgnoreRule,
                );
                break;
              default:
                this.currentIgnoreRule = new RestoreRule(
                  mutatorNames,
                  undefined,
                  this.currentIgnoreRule,
                );
                break;
            }
            break;
        }
      });
  }

  public findIgnoreReason(
    line: number,
    mutatorName: string,
  ): string | undefined {
    mutatorName = mutatorName.toLowerCase();
    return this.currentIgnoreRule.findIgnoreReason(mutatorName, line);
  }

  private warnAboutUnusedDirective(
    mutators: string[],
    directiveType: string,
    scope: string | undefined,
    comment: types.Comment,
  ) {
    for (const mutator of mutators) {
      if (mutator === WILDCARD) continue;
      if (!this.allMutatorNames.includes(mutator.toLowerCase())) {
        this.logger.warn(
          // Scope can be global and therefore undefined
          `Unused 'Stryker ${
            scope ? directiveType + ' ' + scope : directiveType
          }' directive. Mutator with name '${mutator}' not found. Directive found at: ${this.originFileName}:${comment.loc!.start.line}:${
            comment.loc!.start.column
          }.`,
        );
      }
    }
  }
}
