'use strict';

var expect = require('chai').expect;
import TypeUtils from '../../../src/utils/TypeUtils';

describe('TypeUtils', function() {
  var typeUtils: TypeUtils;

  beforeEach(function() {
    typeUtils = new TypeUtils();
  });

  describe('should throw an error', function() {
    it('if an Object is expected and but not provided', function() {
      expect(function() {
        typeUtils.expectParameterObject([], 'TypeUtilsSpec', 'test');
      }).to.throw(Error);
    });
  });

  describe('should not throw an error', function() {
    it('if an Array is expected and provided', function() {
      expect(function() {
        typeUtils.expectParameterArray([], 'TypeUtilsSpec', 'test');
      }).to.not.throw();
    });

    it('if a Boolean is expected and provided', function() {
      expect(function() {
        typeUtils.expectParameterBoolean(true, 'TypeUtilsSpec', 'test');
      }).to.not.throw();
    });

    it('if a Function is expected and provided', function() {
      expect(function() {
        typeUtils.expectParameterFunction(function(){}, 'TypeUtilsSpec', 'test');
      }).to.not.throw();
    });

    it('if a Number is expected and provided', function() {
      expect(function() {
        typeUtils.expectParameterNumber(0, 'TypeUtilsSpec', 'test');
      }).to.not.throw();
    });

    it('if an Object is expected and provided', function() {
      expect(function() {
        typeUtils.expectParameterObject({}, 'TypeUtilsSpec', 'test');
      }).to.not.throw();
    });

    it('if a String is expected and provided', function() {
      expect(function() {
        typeUtils.expectParameterString('Hello world!', 'TypeUtilsSpec', 'test');
      }).to.not.throw();
    });
  });

  describe('should see', function() {
    it('an Array as an Array', function() {
      var result = typeUtils.isArray([]);

      expect(result).to.equal(true);
    });

    it('a Boolean as a Boolean', function() {
      var result = typeUtils.isBoolean(true);

      expect(result).to.equal(true);
    });

    it('a Number as a Number', function() {
      var result = typeUtils.isNumber(0);

      expect(result).to.equal(true);
    });

    it('an Object as an Object', function() {
      var result = typeUtils.isObject({});

      expect(result).to.equal(true);
    });

    it('a String as a String', function() {
      var result = typeUtils.isString('Hello world!');

      expect(result).to.equal(true);
    });
  });

  describe('should not see an Array', function() {
    it('as an Object', function() {
      var result = typeUtils.isObject([]);

      expect(result).to.equal(false);
    });
  });

  describe('should not see a Boolean', function() {
    it('as an Object', function() {
      var result = typeUtils.isObject(true);

      expect(result).to.equal(false);
    });
  });

  describe('should not see a Function', function() {
    it('as an Object', function() {
      var result = typeUtils.isObject(function(){});

      expect(result).to.equal(false);
    });
  });

  describe('should not see a Number', function() {
    it('as an Object', function() {
      var result = typeUtils.isObject(0);

      expect(result).to.equal(false);
    });
  });

  describe('should not see a String', function() {
    it('as an Object', function() {
      var result = typeUtils.isObject('Hello world!');

      expect(result).to.equal(false);
    });
  });
});
