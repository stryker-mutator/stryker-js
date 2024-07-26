
export function isEven(number) {
  // Note: Implemented with a case switch statement, in order to reproduce this issue:
  // https://github.com/stryker-mutator/stryker-js/issues/2469#issuecomment-690303849
  let mod2 = number % 2; 
  let isEven;
  switch(mod2) {
    case 0: {
      isEven = true;
      break;
    }
    case 1: {
      isEven = false;
      break;
    }
  }
  return isEven;
}
