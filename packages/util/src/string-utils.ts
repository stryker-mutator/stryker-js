import { KnownKeys } from './known-keys';
import { Primitive } from './primitive';

type OnlyObject<T> = Exclude<T, Primitive>;

/**
 * Consolidates multiple consecutive white spaces into a single space.
 * @param str The string to be normalized
 */
export function normalizeWhitespaces(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Given a base type, allows type safe access to the name of a property.
 * @param prop The property name
 */
export function propertyPath<T>(prop: KnownKeys<T>): string {
  return String(prop);
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

  public prop<TProp extends KnownKeys<OnlyObject<T>> & keyof OnlyObject<T>>(prop: TProp): PropertyPathBuilder<Pick<OnlyObject<T>, TProp>[TProp]> {
    return new PropertyPathBuilder<Pick<OnlyObject<T>, TProp>[TProp]>([...this.pathSoFar, prop.toString()]);
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
  public static create<K>(): PropertyPathBuilder<K> {
    return new PropertyPathBuilder<K>([]);
  }

  public toString(): string {
    return this.build();
  }
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
