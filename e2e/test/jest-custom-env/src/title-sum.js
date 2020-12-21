
export function titleSum(a, b) {
  const h1 = document.createElement('h1');
  h1.textContent = `${a} + ${b} = ${a + b}`;
  document.body.appendChild(h1);
}
