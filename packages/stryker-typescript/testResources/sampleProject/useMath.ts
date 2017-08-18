import * as math from './math';
import * as rimraf from 'rimraf';

const a = 42;
const b = 31;
console.log(`a + b `, math.add(a, b));
console.log(`a - b `, math.subtract(a, b));
console.log(`a * b `, math.multiply(a, b));
console.log(`a / b `, math.divide(a, b));
console.log(`a ++ `, math.addOne(a, 1));