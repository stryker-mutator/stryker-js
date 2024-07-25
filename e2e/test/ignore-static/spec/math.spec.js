import { MyMath } from '../src/math.js';

let crashNextRun = false;

describe('MyMath', () => {
  // Bad practice, but on purpose. This makes for a hybrid mutant
  const math = new MyMath();

  // Testing the hybrid mutant
  it('should provide value 3.14 for pi', () => {
    expect(math.pi).toEqual(3.14);
  });

  // Testing the static mutant
  it('should be able to provide pi = "🥧"', () => {
    expect(MyMath.pi).toEqual('🥧');
  });

  describe('add', () => {
    let math2;
    beforeEach(() => {
      math2 = new MyMath();
    });

    // Testing the non-static mutant
    it('should be able to add 40 and 2', () => {
      expect(math2.add(40, 2)).toEqual(42);
    });

    // Testing that the hybrid didn't "leak" to, see https://github.com/stryker-mutator/stryker-js/issues/3442
    it('should be able to add pi 2 times', () => {
      expect(math2.add(math.pi, math.pi)).toEqual(6.28);
    });
  });
});

(typeof beforeAll === 'function' ? beforeAll : before)(() => {
  if (crashNextRun && typeof process === 'object') {
    process.exit(1);
  }
});

(typeof afterAll === 'function' ? afterAll : after)(() => {
  // Exit after dry run, so we get a fresh start.
  if (!globalThis.__stryker__?.activeMutant) {
    crashNextRun = true;
  }
});
