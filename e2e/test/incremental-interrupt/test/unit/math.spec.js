import { add, negate, isPositive } from '../../src/math.js';
import { setTimeout } from 'node:timers/promises';
import fs from 'fs';
import os from 'os';
import path from 'path';

describe('Math', function () {
  beforeEach(async () => {
    while (
      fs.existsSync(path.join(os.tmpdir(), 'STRYKER_HAS_BEEN_INTERRUPTED_F32dSD'))
    ) {
      // Sleep so Stryker has a chance to handle the signal
      await setTimeout(100);
    }
  });

  it('should be able to add two numbers', function () {
    expect(add(2, 5)).to.equal(7);
  });

  it('should be able to negate a number', function () {
    expect(negate(2)).to.equal(-2);
  });

  it('should detect positive numbers', function () {
    expect(isPositive(5)).to.be.true;
    expect(isPositive(-5)).to.be.false;
  });
});
