import { KnownKeys } from './known-keys.js';
import { Primitive } from './primitive.js';

type OnlyObject<T> = Exclude<T, Primitive>;

/**
 * Consolidates multiple consecutive white spaces into a single space.
 * @param str The string to be normalized
 */
export function normalizeWhitespaces(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Normalizes line endings as unix style.
 */
export function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n/g, '\n');
}

export interface PropertyPathOverloads<T> {
  (key: KnownKeys<T>): string;
  <TProp1 extends KnownKeys<T>>(
    key: TProp1,
    key2: KnownKeys<OnlyObject<T[TProp1]>>,
  ): string;
  <
    TProp1 extends KnownKeys<T>,
    TProp2 extends KnownKeys<OnlyObject<T[TProp1]>>,
  >(
    key: TProp1,
    key2: TProp2,
    key3: KnownKeys<OnlyObject<OnlyObject<T[TProp1]>[TProp2]>>,
  ): string;
}

/**
 * Given a base type, allows type safe access to the name of a property.
 * @param prop The property name
 */
export function propertyPath<T>(): PropertyPathOverloads<T> {
  const fn: PropertyPathOverloads<T> = ((...args: string[]) =>
    args.join('.')) as unknown as PropertyPathOverloads<T>;
  return fn;
}

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
 */
export function escapeRegExpLiteral(input: string): string {
  return input.replace(/[.*+\-?^${}()|[\]\\/]/g, '\\$&'); // $& means the whole matched string
}

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
 */
export function escapeRegExp(input: string): string {
  return input.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * Normalizes relative or absolute file names to be in posix format (forward slashes '/')
 */
export function normalizeFileName(fileName: string): string {
  return fileName.replace(/\\/g, '/');
}

/**
 * Creates a URL to the page where you can report a bug.
 * @param titleSuggestion The title to be prefilled in.
 */
export function strykerReportBugUrl(titleSuggestion: string): string {
  return `https://github.com/stryker-mutator/stryker-js/issues/new?assignees=&labels=%F0%9F%90%9B+Bug&template=bug_report.md&title=${encodeURIComponent(
    titleSuggestion,
  )}`;
}
