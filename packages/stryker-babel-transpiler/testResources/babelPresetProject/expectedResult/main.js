'use strict';

var _sum = require('./lib/sum');

var _sum2 = _interopRequireDefault(_sum);

var _divide = require('./lib/divide');

var _divide2 = _interopRequireDefault(_divide);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log([1, 2, 3, 4].map(_divide2.default));
console.log([1, 2, 3, 4].map(_sum2.default));