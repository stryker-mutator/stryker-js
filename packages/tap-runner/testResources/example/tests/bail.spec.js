import tap from 'tap';
import { concat } from '../src/formatter.js';

tap.test('Failing test', ({ equal, end }) => {
  equal(concat('3', 'hours'), '3 minutes', 'This test will fail')
  equal(concat('3', 'hours'), '4 hours', 'This test will fail also')
  end();
});

tap.test('This long tests should be bailed', ({ equal, end }) => {
  setTimeout(() => {
    equal(concat('3', 'hours'), '3hours', 'Adding 10 and 5 equal to 15')
    end();
  }, 4000);
});

