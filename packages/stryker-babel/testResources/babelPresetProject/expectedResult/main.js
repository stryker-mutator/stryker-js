'use strict';

var _sum = require('./lib/sum');

var _sum2 = _interopRequireDefault(_sum);

var _devide = require('./lib/devide');

var _devide2 = _interopRequireDefault(_devide);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log([1, 2, 3, 4].map(_devide2.default));
console.log([1, 2, 3, 4].map(_sum2.default));