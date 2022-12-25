import tap from 'tap';
import { add } from '../src/math.js';

tap.test('add', (t) => {
  t.equal(add(40, 2), 42);
  t.done();
});
