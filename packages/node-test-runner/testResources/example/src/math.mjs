export function add(a, b) {
  return a + b;
}

export function slowAdd(a, b) {
  let result = a;
  let i = 0;
  while (i < b) {
    result += 1;
    i++;
  }
  return result;
}
