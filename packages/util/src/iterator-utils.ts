// github.com/tc39/proposal-iterator-helpers
// Can be removed if we remove support for node 20

/** A spec compliant iterator helpers `filter` function */
export function* filter<T>(iter: Iterable<T>, predicate: (item: T) => unknown) {
  for (const item of iter) {
    if (predicate(item)) {
      yield item;
    }
  }
}

/** A spec compliant iterator helpers `map` function */
export function* map<T, U>(iter: Iterable<T>, mapper: (item: T) => U) {
  for (const item of iter) {
    yield mapper(item);
  }
}
