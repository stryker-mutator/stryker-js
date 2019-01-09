import { expect } from 'chai';
import { tokens, commonTokens } from '../../src';

describe('tokens', () => {
  it('should return input as array', () => {
    expect(tokens('a', 'b', 'c')).deep.eq(['a', 'b', 'c']);
  });
  it('should return empty array if called without parameters', () => {
    expect(tokens()).deep.eq([]);
  });
});

describe('commonTokens', () => {
  function itShouldProvideToken<T extends keyof typeof commonTokens>(token: T) {
    it(`should supply token "${token}" as "${token}"`, () => {
      expect(commonTokens[token]).eq(token);
    });
  }
  itShouldProvideToken('config');
  itShouldProvideToken('options');
  itShouldProvideToken('logger');
  itShouldProvideToken('pluginResolver');
  itShouldProvideToken('produceSourceMaps');
  itShouldProvideToken('sandboxFileNames');
  itShouldProvideToken('getLogger');
});
