import { notEmpty } from './notEmpty';
import { KnownKeys } from './KnownKeys';

/**
 * Consolidates multiple consecutive white spaces into a single space.
 * @param str The string to be normalized
 */
export function normalizeWhitespaces(str: string) {
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Given a base type, allows type safe access to the name (or deep path) of a property.
 * @param prop The first property key
 * @param prop2 The optional second property key. Add prop3, prop4, etc to this method signature when needed.
 */
export function propertyPath<T>(prop: keyof Pick<T, KnownKeys<T>>, prop2?: keyof Pick<T, KnownKeys<T>>[typeof prop]): string {
  return [prop, prop2].filter(notEmpty).join('.');
}
