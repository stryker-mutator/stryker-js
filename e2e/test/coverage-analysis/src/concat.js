export function concat(a, b) {
  return `${a}${b}`;
}

// Static mutant
const hi = '👋';

export function greet(name) {
  return `${hi} ${name}`;
}
