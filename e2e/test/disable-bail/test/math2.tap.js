import { test } from 'tap';
import { add } from '../src/math.js';

test(add.name, (t) => {
  // Both kill the same mutant
  t.test('should result in 42 for 41 and 1', (t) => {
    t.equal(add(41, 1), 42);
    t.end();
  });

  t.end();
});
