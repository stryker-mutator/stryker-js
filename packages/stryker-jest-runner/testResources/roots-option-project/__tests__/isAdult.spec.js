const isAdult = require('../lib/isAdult.js');

it('above 18', () => {
  if(!isAdult(19)){
    throw new Error('Test failed');
  }
});