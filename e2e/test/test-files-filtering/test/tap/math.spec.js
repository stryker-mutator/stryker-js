import t from 'tap';
import { add } from '../../src/math.js';

t.test('add should sum correctly', (t) => {
  t.equal(add(1, 2), 3);
  t.end();
});
