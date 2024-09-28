import { test } from 'tap';
import { loop } from '../src/loop.js';

test('loop should result in 15 for n=5 and a sum function', (t) => {
  let result = 0;
  loop(5, (n) => (result += n));
  t.equal(result, 15);
  t.end();
});
