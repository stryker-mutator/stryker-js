const sum = require('./lib/sum');
const divide = require('./lib/divide');
const square = require('./lib/square');

[1,2,3,4].map(number => {
    console.log(sum(number));
    console.log(divide(number));
    console.log(square(number));
});