function concat(a, b){
  return `${a}${b}`;
};

// Static mutant
const hi = '👋';

function greet(name) {
  return `${hi} ${name}`
}

// Stryker disable all: Not useful for coverage analysis test
if(typeof module === 'object') {
  module.exports = {
    concat,
    greet
  }
}
