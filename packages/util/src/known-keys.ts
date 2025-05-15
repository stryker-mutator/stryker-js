/**
 * Known keys filters out the index signature from the keys of a type
 * @see https://stackoverflow.com/questions/51465182/typescript-remove-index-signature-using-mapped-types
 */
export type KnownKeys<T> = keyof {
  [P in keyof T as string extends P
    ? never
    : number extends P
      ? never
      : P]: T[P];
};
