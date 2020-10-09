/**
 * Known keys filters out the index signature from the keys of a type
 * @see https://stackoverflow.com/questions/51465182/typescript-remove-index-signature-using-mapped-types
 */
export type KnownKeys<T> = {
  [K in keyof T]: string extends K ? never : number extends K ? never : K;
} extends { [_ in keyof T]: infer U }
  ? U
  : never;
