import { test } from 'tap';
import { MyMath } from '../src/math.js';

test('MyMath', (t) => {
  // Bad practice, but on purpose. This makes for a hybrid mutant
  const math = new MyMath();

  // Testing the hybrid mutant
  t.test('should provide value 3.14 for pi', (t) => {
    t.equal(math.pi, 3.14);
    t.end();
  });

  // Testing the static mutant
  t.test('should be able to provide pi = "🥧"', (t) => {
    t.equal(MyMath.pi, '🥧');
    t.end();
  });

  t.test('add', (t) => {
    let math2;
    t.beforeEach(() => {
      math2 = new MyMath();
    });

    // Testing the non-static mutant
    t.test('should be able to add 40 and 2', (t) => {
      t.equal(math2.add(40, 2), 42);
      t.end();
    });

    // Testing that the hybrid didn't "leak" to, see https://github.com/stryker-mutator/stryker-js/issues/3442
    t.test('should be able to add pi 2 times', (t) => {
      t.equal(math2.add(math.pi, math.pi), 6.28);
      t.end();
    });

    t.end();
  });

  t.end();
});
