function factorial (num) {
  if (typeof (num) !== 'number') throw new Error("Input must be a number.");
  if (num < 0) throw new Error("Input must not be negative.");
  var i = 2,
    o = 1;

  // Stryker disable next-line BlockStatement: Infinite loop
  while (i <= num) {
    // Stryker disable next-line UpdateOperator: Infinite loop
    o *= i++;
  }

  return o;
};
