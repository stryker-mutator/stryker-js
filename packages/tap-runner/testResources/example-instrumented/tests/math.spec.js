import tap from 'tap';
import { add, slowAdd } from '../src/math.js';

tap.test('Adding two numbers', ({ equal, end }) => {
  equal(add(5, 10), 15, 'Adding 10 and 5 equal to 15')
  equal(add(100, 200), 300, 'Adding 100 and 200 equal to 300')
  end();
});

tap.test('Slow adding two numbers', ({ equal, end }) => {
  equal(slowAdd(5, 10), 15, 'Adding 10 and 5 equal to 15')
  equal(slowAdd(100, 200), 300, 'Adding 100 and 200 equal to 300')
  end();
});
