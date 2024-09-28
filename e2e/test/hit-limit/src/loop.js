/**
 * This loop will result in an infinite loop when Stryker mutates it.
 */
export function loop(n, action) {
  let goOn = true;
  while(goOn) {
    action(n);
    n--;
    goOn = n > 0;
  }
}

