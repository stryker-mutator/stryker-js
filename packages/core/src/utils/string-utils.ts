import { propertyPath } from '@stryker-mutator/util';
import { StrykerOptions, schema } from '@stryker-mutator/api/core';

/** Extracted from emoji-regex-xs
 Copyright (c) 2025 Steven Levithan licensed under the MIT license */
const r = String.raw;
const base = r`\p{Emoji}(?:\p{EMod}|[\u{E0020}-\u{E007E}]+\u{E007F}|\uFE0F?\u20E3?)`;
const emojiRe = new RegExp(
  r`\p{RI}{2}|(?![#*\d](?!\uFE0F?\u20E3))${base}(?:\u200D${base})*`,
  'gu',
);

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
    case 'Killed':
      return '✅';
    case 'NoCoverage':
      return '🙈';
    case 'Ignored':
      return '🤥';
    case 'Survived':
      return '👽';
    case 'Timeout':
      return '⏰';
    case 'Pending':
      return '⌛';
    case 'RuntimeError':
    case 'CompileError':
      return '💥';
  }
}

export function stringWidth(input: string): number {
  let { length } = input;
  for (const match of input.matchAll(emojiRe)) {
    length = length - match[0].length + 2;
  }
  return length;
}

/**
 * Print the name of (or path to) a stryker option
 */
export const optionsPath = propertyPath<StrykerOptions>();
