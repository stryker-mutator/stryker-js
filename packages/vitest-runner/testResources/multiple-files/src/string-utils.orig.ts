export function concat(a: string, b: string): string {
  return a + b;
}

export function capitalize(str: string): string {
  if (!str) return '';
  return str[0].toUpperCase() + str.slice(1);
}