export function count(letters: string): Int8Array {
  const c = new Int8Array(26);
  for (const letter of letters) {
    c[letter.charCodeAt(0) - 65]!++;
  }
  return c;
}
