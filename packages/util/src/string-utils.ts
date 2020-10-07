import { KnownKeys } from './known-keys';

/**
 * Consolidates multiple consecutive white spaces into a single space.
 * @param str The string to be normalized
 */
export function normalizeWhitespaces(str: string) {
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Given a base type, allows type safe access to the name of a property.
 * @param prop The property name
 */
export function propertyPath<T>(prop: keyof Pick<T, KnownKeys<T>>): string {
  return prop.toString();
}

/**
 * A helper class to allow you to get type safe access to the name of a deep property of `T`
 * @example
 * ```ts
 * PropertyPathBuilder<StrykerOptions>('warnings').prop('unknownOptions').build()
 * ```
 */
export class PropertyPathBuilder<T> {
  constructor(private readonly pathSoFar: string[]) {}

  public prop<TProp extends KnownKeys<T>>(prop: TProp) {
    return new PropertyPathBuilder<Pick<T, KnownKeys<T>>[TProp]>([...this.pathSoFar, prop.toString()]);
  }

  /**
   * Build the (deep) path to the property name
   */
  public build(): string {
    return this.pathSoFar.join('.');
  }

  /**
   * Creates a new `PropertyPathBuilder` for type T
   */
  public static create<T>() {
    return new PropertyPathBuilder<T>([]);
  }

  public toString(): string {
    return this.build();
  }
}

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
 */
export function escapeRegExpLiteral(input: string) {
  return input.replace(/[.*+\-?^${}()|[\]\\/]/g, '\\$&'); // $& means the whole matched string
}

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
 */
export function escapeRegExp(input: string) {
  return input.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
