function add(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}

function addOne(a) {
  return ++a;
}

// // Static mutant
// const hi = '👋';

// function greet(name) {
//   return `${hi} ${name}`
// }

// Stryker disable all: Not useful for coverage analysis test
if (typeof module === 'object') {
  module.exports = {
    add,
    multiply,
    addOne,
    // greet,
  };
}
