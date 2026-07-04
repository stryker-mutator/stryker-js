import { expect } from 'chai';

import { fileOfTestId, toTestId } from '../../src/test-id.js';

describe('test-id', () => {
  it('round-trips the file out of an encoded id', () => {
    const id = toTestId('tests/math.spec.mjs', 'adds two numbers');
    expect(fileOfTestId(id)).eq('tests/math.spec.mjs');
  });

  it('keeps equally-named tests in different files distinct', () => {
    expect(toTestId('a.mjs', 'works')).not.eq(toTestId('b.mjs', 'works'));
  });

  it('returns the whole id when there is no separator', () => {
    expect(fileOfTestId('no-separator')).eq('no-separator');
  });

  it('handles names that contain spaces and symbols', () => {
    const id = toTestId('t/x.spec.mjs', 'does > 0 when given a + b');
    expect(fileOfTestId(id)).eq('t/x.spec.mjs');
  });
});
