const sum = require("./lib/sum");
const square = require("./lib/square");
const divide = require("./lib/divide");

const answerArray = [];

[1,2,3,4].map(function(number) {
    answerArray.push(sum(number, number));
    answerArray.push(square(number, number));
    answerArray.push(divide(number, number));
});

console.log(answerArray);