import tap from 'tap';
import { concat } from '../src/formatter.js';

tap.test('Failing test', ({ equal, end }) => {
  equal(concat('3', 'hours'), '3 minutes', 'This test will fail')
  end();
});

tap.test('This long tests could be bailed', ({ equal, end }) => {
  setTimeout(() => {
    equal(concat('3', 'hours'), '3hour', '3hours is not 3hours')
    end();
  }, 2000);
});

