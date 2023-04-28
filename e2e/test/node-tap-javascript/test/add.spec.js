// @ts-check
import tap from 'tap';
import { negate, addOne, isNegativeNumber, add } from '../src/math.js';

tap.test('math', (t) => {
  t.equal(add(2, 5), 7);
  t.equal(addOne(2), 3);
  t.equal(negate(2), -2);
  t.ok(isNegativeNumber(-2));
  t.notOk(isNegativeNumber(0));
  t.end();
});
