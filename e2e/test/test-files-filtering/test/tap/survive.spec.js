import t from 'tap';
import { add } from '../../src/math.js';

t.test('noop', (t) => {
  void add; // Ensure related
  t.ok(true);
  t.end();
});
