export function isNegativeNumber(number: number) {
  var isNegative = false;
  if (number < 0) {
    isNegative = true;
  }
  console.log(`${isNegative}`);
  return isNegative;
}
