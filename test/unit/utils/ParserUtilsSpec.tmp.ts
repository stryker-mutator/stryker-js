'use strict';

var expect = require('chai').expect;
import * as parserUtils from '../../../src/utils/ParserUtils';
require('mocha-sinon');

describe('ParserUtils', function() {

  describe('should throw an error', function(){
    it('if no code is provided when parsing', function() {
      expect(parserUtils.parse).to.throw(Error);
    });

  });

  it('should return an empty object if an empty string is parsed', function() {
    var emptyObject = {};

    var result = parserUtils.parse('');
    expect(JSON.stringify(result)).to.equal(JSON.stringify(emptyObject));
  });

});
