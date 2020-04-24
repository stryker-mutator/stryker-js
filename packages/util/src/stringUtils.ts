import { notEmpty } from './notEmpty';

/**
 * Consolidates multiple consecutive white spaces into a single space.
 * @param str The string to be normalized
 */
export function normalizeWhitespaces(str: string) {
  return str.replace(/\s+/g, ' ').trim();
}

export function propertyPath<T>(prop: keyof T, prop2?: keyof T[typeof prop]): string {
  return [prop, prop2].filter(notEmpty).join('.');
}
