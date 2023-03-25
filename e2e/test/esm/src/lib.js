export function add(a, b) {
  return a + b;
}

const wave = '👋'; // static mutant
export function greet(name) {
  return `${wave} ${name}`;
}

export function inc(a) {
  return ++a;
}

export function notCoveredSubtract(a, b) {
  return a - b;
}
