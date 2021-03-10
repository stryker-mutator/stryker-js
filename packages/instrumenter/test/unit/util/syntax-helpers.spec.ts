import { expect } from 'chai';

import * as syntaxHelpers from '../../../src/util/syntax-helpers';

describe('syntax-helpers', () => {
  describe('instrumentationBabelHeader', () => {
    it('should be immutable', () => {
      expect(syntaxHelpers.instrumentationBabelHeader).frozen;
      expect(syntaxHelpers.instrumentationBabelHeader[0].leadingComments).frozen;
    });
  });
});
