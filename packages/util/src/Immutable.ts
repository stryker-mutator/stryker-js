type ImmutablePrimitive = undefined | null | boolean | string | number | Function;

export type Immutable<T> = T extends ImmutablePrimitive
  ? T
  : T extends Array<infer U>
  ? ImmutableArray<U>
  : T extends Map<infer K, infer V>
  ? ImmutableMap<K, V>
  : T extends Set<infer M>
  ? ImmutableSet<M>
  : ImmutableObject<T>;

export type ImmutableArray<T> = ReadonlyArray<Immutable<T>>;
export type ImmutableMap<K, V> = ReadonlyMap<Immutable<K>, Immutable<V>>;
export type ImmutableSet<T> = ReadonlySet<Immutable<T>>;
export type ImmutableObject<T> = { readonly [K in keyof T]: Immutable<T[K]> };

export function deepFreeze<T>(target: T): Immutable<T> {
  switch (typeof target) {
    case 'object':
      if (Array.isArray(target)) {
        return Object.freeze(target.map(deepFreeze)) as Immutable<T>;
      }
      if (target instanceof Map) {
        return (Object.freeze(new Map([...target.entries()].map(([k, v]) => [deepFreeze(k), deepFreeze(v)]))) as unknown) as Immutable<T>;
      }
      if (target === null) {
        return null as Immutable<T>;
      }
      if (target instanceof Set) {
        return (Object.freeze(new Set([...target.values()].map(deepFreeze))) as unknown) as Immutable<T>;
      }
      return Object.freeze({
        ...Object.entries(target).reduce((result, [prop, val]) => {
          result[prop] = deepFreeze(val);
          return result;
        }, {} as any),
      });
    default:
      return target as Immutable<T>;
  }
}
