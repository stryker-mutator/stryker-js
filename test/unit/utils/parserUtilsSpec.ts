'use strict';

import * as sinon from 'sinon';
import * as esprima from 'esprima';
import { expect } from 'chai';
import * as parserUtils from '../../../src/utils/parserUtils';

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

    it('should use sourceType: module for esprima', () => {
      const esprimaParseSpy = sinon.spy(esprima, 'parse');
      parserUtils.parse('function() {}');
      expect(esprimaParseSpy.args[0][1].sourceType).to.equal('module');
    });
  });

});
