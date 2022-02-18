function add(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}

function addOne(a) {
  return ++a;
}

// Stryker disable all: Not useful for coverage analysis test
if (typeof module === 'object') {
  module.exports = {
    add,
    multiply,
    addOne,
  };
}
