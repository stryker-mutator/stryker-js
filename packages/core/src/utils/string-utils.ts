import { propertyPath } from '@stryker-mutator/util';
import { schema } from '@stryker-mutator/api/core';
import { StrykerOptions } from '@stryker-mutator/api/core';

const { MutantStatus } = schema;

export function wrapInClosure(codeFragment: string): string {
  return `
    (function (window) {
      ${codeFragment}
    })((Function('return this'))());`;
}

export function padLeft(input: string): string {
  return input
    .split('\n')
    .map((str) => '\t' + str)
    .join('\n');
}

export function plural(items: number): string {
  if (items > 1) {
    return 's';
  } else {
    return '';
  }
}

export function serialize(thing: unknown): string {
  return JSON.stringify(thing);
}

export function deserialize<T>(stringified: string): T {
  return JSON.parse(stringified);
}

export function getEmojiForStatus(status: schema.MutantStatus): string {
  switch (status) {
    case MutantStatus.Killed:
      return '✅';
    case MutantStatus.NoCoverage:
      return '🙈';
    case MutantStatus.Ignored:
      return '🤥';
    case MutantStatus.Survived:
      return '👽';
    case MutantStatus.Timeout:
      return '⌛';
    case MutantStatus.RuntimeError:
    case MutantStatus.CompileError:
      return '💥';
  }
}

/**
 * Print the name of (or path to) a stryker option
 */
export const optionsPath = propertyPath<StrykerOptions>();
