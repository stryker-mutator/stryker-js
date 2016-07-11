'use strict';

var expect = require('chai').expect;
import * as parserUtils from '../../../src/utils/parserUtils';
require('mocha-sinon');

describe('parserUtils', () => {

  describe('collectFrozenNodes', () => {

    it('when provided a try catch block', () => {
      // A try catch block has recursion. See
      // http://esprima.org/demo/parse.html?code=try%20%7B%0D%0A%20%20%20%20%20%20%20%20configModule(config)%3B%0D%0A%20%20%20%20%20%20%7D%0D%0A%20%20%20%20%20%20catch%20(e)%20%7B%0D%0A%20%20%20%20%20%20%20%20process.exit(1)%3B%0D%0A%20%20%20%20%20%20%7D

      let parsedTryCatch = parserUtils.parse(`try {
        configModule(config);
      }
      catch (e) {
        process.exit(1);
      }`);
      parserUtils.collectFrozenNodes(parsedTryCatch);
    });
  });

  describe('parse', () => {

    describe('should throw an error', () => {
      it('if no code is provided when parsing', () => {
        expect(parserUtils.parse).to.throw(Error);
      });

    });


    it('should return an empty object if an empty string is parsed', () => {
      var emptyObject = {};

      var result = parserUtils.parse('');
      expect(JSON.stringify(result)).to.equal(JSON.stringify(emptyObject));
    });
  });

});
