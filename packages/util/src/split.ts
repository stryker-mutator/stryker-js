export function split<T>(
  values: Iterable<T>,
  predicate: (value: T, index: number) => boolean,
): [T[], T[]] {
  const left: T[] = [];
  const right: T[] = [];
  let index = 0;
  for (const value of values) {
    if (predicate(value, index++)) {
      left.push(value);
    } else {
      right.push(value);
    }
  }
  return [left, right];
}
