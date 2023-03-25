export function notEmpty<T>(item: T | null | undefined): item is T {
  return item !== undefined && item !== null;
}
