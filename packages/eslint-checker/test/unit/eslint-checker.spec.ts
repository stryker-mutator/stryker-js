import { describe, it } from 'mocha';
import { expect } from 'chai';

import { foo } from '../../src/eslint-checker.js';

describe('eslint-checker', () => {
  it('needs tests', () => {
    foo();
    expect(1).to.equal(1);
  });
});
