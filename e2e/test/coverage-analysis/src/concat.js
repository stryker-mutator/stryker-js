function concat(a, b){
  return `${a}${b}`;
};

// Stryker disable all: Not useful for coverage analysis test
if(typeof module === 'object') {
  module.exports.concat = concat;
}
