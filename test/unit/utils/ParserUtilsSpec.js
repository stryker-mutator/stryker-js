'use strict';

var expect = require('chai').expect;
var ParserUtils = require('../../../src/utils/ParserUtils');
require('mocha-sinon');

describe('ParserUtils', function() {
  var parserUtils;

  beforeEach(function() {
    parserUtils = new ParserUtils();
  });

  describe('should throw an error', function(){
    it('if no code is provided when parsing', function() {
      expect(parserUtils.parse).to.throw(Error);
    });

    it('if no abstract syntax tree is provided when generating code', function() {
      expect(parserUtils.generate).to.throw(Error);
    });
  });

  it('should return an empty object if an empty string is parsed', function() {
    var emptyObject = {};

    var result = parserUtils.parse('');
    expect(JSON.stringify(result)).to.equal(JSON.stringify(emptyObject));
  });

  describe('should not modify code', function(){
    it('if it contains comments', function() {
      var expectedCode =
      '// Comment on the first line\
      var i = 0;\
      /*\
      * Multiline\
      * comment\
      */\
      var j = i; // Comment at the end of a line\
      // Comment on the last line';

      var ast = parserUtils.parse(expectedCode);
      var actualCode = parserUtils.generate(ast);

      expect(actualCode).to.equal(expectedCode);
    });

    it('if it contains empty lines', function() {
      var expectedCode = 'var i = 0;\n\n\nvar j = i;';

      var ast = parserUtils.parse(expectedCode);
      var actualCode = parserUtils.generate(ast);

      expect(actualCode).to.equal(expectedCode);
    });

    // it('if a for-loop is written on one line', function() {
    //   var expectedCode = 'for(var i = 0;i< 10; i++) { console.log(i);}';
    //
    //   var ast = parserUtils.parse(expectedCode);
    //   var actualCode = parserUtils.generate(ast);
    //
    //   expect(actualCode).to.equal(expectedCode);
    // });
  });
});
