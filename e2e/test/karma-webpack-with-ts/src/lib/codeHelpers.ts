
export function pathJoin(...parts: string[]) {
  return parts.reduce((prev, current) => (prev.length ? (current ? `${prev}/${current}` : prev) : current), '');
}
