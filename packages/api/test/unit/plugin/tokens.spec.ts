import { expect } from 'chai';

import { commonTokens, tokens } from '../../../src/plugin/index.js';

describe('tokens', () => {
  it('should return input as array', () => {
    expect(tokens('a', 'b', 'c')).deep.eq(['a', 'b', 'c']);
  });
  it('should return empty array if called without parameters', () => {
    expect(tokens()).deep.eq([]);
  });
});

describe('commonTokens', () => {
  function itShouldProvideToken(token: keyof typeof commonTokens) {
    it(`should supply token "${token}" as "${token}"`, () => {
      expect(commonTokens[token]).eq(token);
    });
  }
  itShouldProvideToken('options');
  itShouldProvideToken('logger');
  itShouldProvideToken('getLogger');
});
