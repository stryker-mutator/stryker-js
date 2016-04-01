'use strict';

var expect = require('chai').expect;
import * as parserUtils from '../../../src/utils/parserUtils';
require('mocha-sinon');

describe('parserUtils', function() {

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
