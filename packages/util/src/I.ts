/**
 * A small mapped type that extracts only the public interface
 * from a type.
 */
export type I<T> = {
  [K in keyof T]: T[K];
};
