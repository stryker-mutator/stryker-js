export function max(...numbers: number[]) {
  return Math.max(...numbers);
}

export function total(...numbers: number[]) {
  return numbers.reduce((a, b) => a + b);
}
